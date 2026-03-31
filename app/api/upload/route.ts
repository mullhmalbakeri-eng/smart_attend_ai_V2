import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    const userId = data.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "الرجاء اختيار ملف وتحديد المستخدم" }, { status: 400 });
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت" }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. الرجاء رفع صورة (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء مجلد public/uploads إذا لم يكن موجوداً
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // تجاهل خطأ المجلد إذا كان موجوداً
    }

    // معالجة الصورة باستخدام Sharp
    let processedBuffer = buffer;
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const safeFilename = `${userId}-${timestamp}.webp`;
    const filePath = path.join(uploadDir, safeFilename);

    try {
      // تحويل الصورة إلى WebP مع تحسين الجودة والحجم
      processedBuffer = Buffer.from(await sharp(buffer)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 85,
          effort: 6
        })
        .toBuffer());
    } catch (sharpError) {
      console.error("Sharp processing error:", sharpError);
      // إذا فشلت معالجة الصورة، استخدم الأصلية
      processedBuffer = buffer;
    }

    // كتابة الملف على الهارد ديسك
    await writeFile(filePath, processedBuffer);

    // تحديث مسار الصورة في قاعدة البيانات (المسار النسبي)
    const relativePath = `/uploads/${safeFilename}`;
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { image: relativePath },
    });
    
    return NextResponse.json({ 
      success: true, 
      imagePath: relativePath,
      message: "تم رفع الصورة بنجاح"
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "فشل رفع الصورة. الرجاء المحاولة مرة أخرى" 
    }, { status: 500 });
  }
}
