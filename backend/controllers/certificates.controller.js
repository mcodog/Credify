import { InferenceClient } from "@huggingface/inference";
import { supabaseAdmin } from "../services/supabase.service.js";
import cloudinary from "cloudinary";
import crypto from "crypto";

import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../services/motoko.service.js";

const canisterId = "3db7c-uaaaa-aaaaa-qalea-cai"; 

const client = new InferenceClient(process.env.HF_TOKEN);
const agent = new HttpAgent({
  host: "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=3db7c-uaaaa-aaaaa-qalea-cai",
});
// agent.fetchRootKey();
const certificateRegistryActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: canisterId,
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const checkConnection = async () => {
  try {
    // Calling a simple query method to check if the canister is connected
    const result = await certificateRegistryActor.getCertificate("someId");
    console.log("Connection successful:", result);
  } catch (error) {
    console.error("Error connecting to the canister:", error);
  }
};

export const storeToBlockChain = async (req, res) => {
  const { id, fileHash, contentHash, fileType, imageUrl, ocrContent } =
    req.body;
  console.log(agent);
  await checkConnection();
  console.log("Available Methods: ", Object.keys(certificateRegistryActor));
  try {
    const result = await certificateRegistryActor.storeCertificate(
      id,
      fileHash,
      contentHash,
      fileType,
      imageUrl,
      ocrContent
    );
    if (!result) {
      console.log("Failed to store in blockchain. Response:", result);
      throw new Error("Failed to store certificate in blockchain");
    }
    console.log("Successfully stored certificate in blockchain:", result);
  } catch (error) {
    console.error("Error storing certificate in blockchain:", error);
    throw error;
  }
};

const storeToBlockChainHelper = async (payload) => {
  const { id, fileHash, contentHash, fileType, imageUrl, ocrContent } = payload;

  try {
    const result = certificateRegistryActor.storeCertificate(
      id,
      fileHash,
      contentHash,
      fileType,
      imageUrl,
      ocrContent
    );

    console.log("Successfully stored certificate in blockchain:", result);
  } catch (error) {
    console.error("Error storing certificate in blockchain:", error);
    throw error;
  }
};

const base64ToBuffer = (base64String) => {
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  let data = base64String;
  if (matches) {
    data = matches[2];
  }
  return Buffer.from(data, "base64");
};

/**
 * Validate file type and size
 */
const validateFile = (mimeType, buffer) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
  ];

  const allowedPdfTypes = ["application/pdf"];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (!mimeType) {
    throw new Error("Invalid file format: MIME type not detected");
  }

  const isImage = allowedImageTypes.includes(mimeType);
  const isPdf = allowedPdfTypes.includes(mimeType);

  if (!isImage && !isPdf) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Only images (JPEG, PNG, GIF, WebP, BMP, TIFF) and PDF files are allowed.`
    );
  }

  if (buffer.length > maxFileSize) {
    throw new Error(
      `File too large: ${(buffer.length / 1024 / 1024).toFixed(
        2
      )}MB. Maximum size is 10MB.`
    );
  }

  return { isImage, isPdf };
};

/**
 * Generate SHA-256 hash from buffer data
 */
const generateFileHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/**
 * Generate SHA-256 hash from text content
 */
const generateContentHash = (content) => {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
};

export const uploadBase64 = async (req, res) => {
  try {
    const { userId, fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "No file data received" });
    }

    // Convert base64 to Buffer
    const buffer = base64ToBuffer(fileData);
    const fileName = `certificate_${userId || "anonymous"}_${Date.now()}`;

    // Determine file type and mime type from base64 data
    const mimeType = fileData.match(/^data:([A-Za-z-+/]+);base64,/)?.[1];

    // Validate file type and size
    try {
      const { isImage, isPdf } = validateFile(mimeType, buffer);

      // Generate file hash early
      const fileHash = generateFileHash(buffer);

      // Upload to Cloudinary with appropriate settings
      const uploadOptions = {
        public_id: `certificates/${fileName}`,
        folder: "certificates",
        overwrite: false,
      };

      if (isPdf) {
        // Upload PDF as image for automatic conversion to JPG
        uploadOptions.resource_type = "image";
        uploadOptions.format = "jpg";
        uploadOptions.page = 1; // Convert only first page
        uploadOptions.quality = "auto";
      } else {
        uploadOptions.resource_type = "image";
        // Auto-optimize images
        uploadOptions.quality = "auto";
        uploadOptions.fetch_format = "auto";
      }

      const cloudinaryUpload = await cloudinary.v2.uploader.upload(
        fileData,
        uploadOptions
      );

      if (!cloudinaryUpload.secure_url) {
        return res
          .status(500)
          .json({ error: "Failed to upload to Cloudinary" });
      }

      const imageUrl = cloudinaryUpload.secure_url;
      console.log("Cloudinary URL:", imageUrl);

      // For PDFs, create image URL for OCR (convert first page to image)
      let ocrImageUrl = imageUrl;
      if (isPdf) {
        ocrImageUrl = cloudinary.v2.url(cloudinaryUpload.public_id, {
          quality: "auto",
          width: 2000,
          crop: "limit",
        });
      }

      console.log("OCR Image URL:", ocrImageUrl);

      // Extract text content using OCR with improved prompts
      const ocrPrompt = isPdf
        ? `Extract and return only the text content from this PDF document. Preserve the structure and formatting as much as possible. Return the text as plain text without any JSON structure or additional commentary.`
        : `Extract and return only the text content from this image/certificate. Preserve the structure and formatting as much as possible. Return the text as plain text without any JSON structure or additional commentary.`;

      const chatCompletion = await client.chatCompletion({
        provider: "fireworks-ai",
        model: "Qwen/Qwen2.5-VL-32B-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: ocrPrompt,
              },
              {
                type: "image_url",
                image_url: { url: ocrImageUrl },
              },
            ],
          },
        ],
      });

      const ocrContent = chatCompletion.choices[0].message.content;
      const contentHash = generateContentHash(ocrContent);

      // Save complete record to certificates table
      const { data: certificate, error: insertError } = await supabaseAdmin
        .from("certificates")
        .upsert([
          {
            certificate_hash: fileName,
            certificate_name: fileName,
            user_id: userId || null,
            image_url: imageUrl,
            file_type: isPdf ? "pdf" : "image",
            ocr_content: ocrContent,
            file_hash: fileHash,
            content_hash: contentHash,
            file_size: buffer.length,
            mime_type: mimeType,
            cloudinary_public_id: cloudinaryUpload.public_id,
            verification_status: "verified",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return res
          .status(500)
          .json({ error: "Failed to save certificate record" });
      }

      // Also store in hash table for backward compatibility
      const { data: hashRecord, error: hashInsertError } = await supabaseAdmin
        .from("hash")
        .insert([
          {
            file_hash: fileHash,
            content_hash: contentHash,
            user_id: userId || null,
            certificate_id: certificate.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (hashInsertError) {
        console.error("Hash insert error:", hashInsertError);
        // Don't fail the whole request, just log the error
      }

      console.log("File uploaded and processed:");
      console.log("- Certificate ID:", certificate.id);
      console.log("- File type:", isPdf ? "PDF" : "Image");
      console.log(
        "- File size:",
        `${(buffer.length / 1024 / 1024).toFixed(2)}MB`
      );
      console.log("- MIME type:", mimeType);
      console.log("- File hash:", fileHash);
      console.log("- Content hash:", contentHash);
      console.log("- OCR content:", ocrContent.substring(0, 100) + "...");

      const blockChainPayload = {
        id: certificate.id,
        fileHash: certificate.file_hash,
        contentHash: certificate.content_hash,
        fileType: certificate.file_type,
        imageUrl: certificate.image_url,
        ocrContent: certificate.ocr_content,
      };
      storeToBlockChainHelper(blockChainPayload);

      return res.json({
        message: "File uploaded, processed, and hashes generated successfully",
        certificateId: certificate.id,
        imageUrl,
        fileType: isPdf ? "pdf" : "image",
        mimeType,
        fileSize: buffer.length,
        fileHash,
        contentHash,
        ocrContent,
        hashId: hashRecord?.id,
        certificate: {
          id: certificate.id,
          certificateHash: certificate.certificate_hash,
          imageUrl: certificate.image_url,
          fileType: certificate.file_type,
          fileHash: certificate.file_hash,
          contentHash: certificate.content_hash,
          ocrContent: certificate.ocr_content,
          fileSize: certificate.file_size,
          mimeType: certificate.mime_type,
          verificationStatus: certificate.verification_status,
          createdAt: certificate.created_at,
        },
      });
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
  } catch (error) {
    console.error("uploadBase64 error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { data: certificates, error: fetchError } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Fetch certificates error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch certificates" });
    }

    return res.json({
      message: "Certificates retrieved successfully",
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("getUserCertificates error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCertificates = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "desc",
      fileType,
      verificationStatus,
    } = req.query;

    let query = supabaseAdmin.from("certificates").select("*");

    // Add filters if provided
    if (fileType) {
      query = query.eq("file_type", fileType);
    }

    if (verificationStatus) {
      query = query.eq("verification_status", verificationStatus);
    }

    // Add sorting
    const ascending = sortOrder.toLowerCase() === "asc";
    query = query.order(sortBy, { ascending });

    // Add pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: certificates, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch all certificates error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch certificates" });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from("certificates")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.warn("Failed to get total count:", countError);
    }

    return res.json({
      message: "All certificates retrieved successfully",
      certificates,
      count: certificates.length,
      totalCount: count || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: certificates.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getAllCertificates error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCertificateStats = async (req, res) => {
  try {
    // Get overall statistics
    const { data: allCerts, error: allError } = await supabaseAdmin
      .from("certificates")
      .select("file_type, verification_status, file_size");

    if (allError) {
      console.error("Get stats error:", allError);
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }

    const stats = {
      total: allCerts.length,
      byFileType: {},
      byVerificationStatus: {},
      totalFileSize: 0,
    };

    allCerts.forEach((cert) => {
      // Count by file type
      stats.byFileType[cert.file_type] =
        (stats.byFileType[cert.file_type] || 0) + 1;

      // Count by verification status
      stats.byVerificationStatus[cert.verification_status] =
        (stats.byVerificationStatus[cert.verification_status] || 0) + 1;

      // Sum file sizes
      stats.totalFileSize += cert.file_size || 0;
    });

    return res.json({
      message: "Certificate statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("getCertificateStats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({ error: "Certificate ID is required" });
    }

    // Fetch certificate first
    const { data: certificate, error: fetchError } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("id", certificateId)
      .single();

    if (fetchError || !certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (certificate.revoked) {
      return res.status(400).json({ error: "Certificate is already revoked" });
    }

    // Update certificate to set revoked = true
    const { error: updateError } = await supabaseAdmin
      .from("certificates")
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", certificateId);

    if (updateError) {
      console.error("Failed to revoke certificate:", updateError);
      return res.status(500).json({ error: "Failed to revoke certificate" });
    }

    return res.json({
      message: "Certificate revoked successfully",
      certificateId,
      revokedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("revokeCertificate error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unrevokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({ error: "Certificate ID is required" });
    }

    // Fetch certificate first
    const { data: certificate, error: fetchError } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("id", certificateId)
      .single();

    if (fetchError || !certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (!certificate.revoked) {
      return res.status(400).json({ error: "Certificate is not revoked" });
    }

    // Update certificate to set revoked = false
    const { error: updateError } = await supabaseAdmin
      .from("certificates")
      .update({
        revoked: false,
        revoked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", certificateId);

    if (updateError) {
      console.error("Failed to unrevoke certificate:", updateError);
      return res.status(500).json({ error: "Failed to unrevoke certificate" });
    }

    return res.json({
      message: "Certificate unrevoked successfully",
      certificateId,
      unrevokedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("unrevokeCertificate error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRevokedCertificates = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortBy = "revoked_at",
      sortOrder = "desc",
      fileType,
    } = req.query;

    let query = supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("revoked", true);

    // Add filters if provided
    if (fileType) {
      query = query.eq("file_type", fileType);
    }

    // Add sorting
    const ascending = sortOrder.toLowerCase() === "asc";
    query = query.order(sortBy, { ascending });

    // Add pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: certificates, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch revoked certificates error:", fetchError);
      return res
        .status(500)
        .json({ error: "Failed to fetch revoked certificates" });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("revoked", true);

    if (countError) {
      console.warn("Failed to get total count:", countError);
    }

    return res.json({
      message: "Revoked certificates retrieved successfully",
      certificates,
      count: certificates.length,
      totalCount: count || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: certificates.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getRevokedCertificates error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add this function to your existing certificates.controller.js

export const getUserCertificatesByNameAndId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // First, get user's first and last name from the database
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("firstname, lastname")
      .eq("auth_id", userId)
      .single();

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    const { firstname: firstName, lastname: lastName } = userData;

    // If user doesn't have first and last name, return empty array
    if (!firstName || !lastName) {
      return res.json({
        message: "User name information not available for certificate search",
        certificates: [],
        count: 0,
      });
    }

    const fullName = `${firstName} ${lastName}`;
    
    // Search for certificates containing the user's name in OCR content only
    const { data: certificatesByName, error: nameError } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .or(`ocr_content.ilike.%${firstName}%,ocr_content.ilike.%${lastName}%,ocr_content.ilike.%${fullName}%`)
      .eq("revoked", false) // Only show non-revoked certificates
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (nameError) {
      console.error("Fetch certificates by name error:", nameError);
      return res.status(500).json({ error: "Failed to fetch certificates by name" });
    }

    return res.json({
      message: "Certificates retrieved successfully by name recognition",
      certificates: certificatesByName || [],
      count: (certificatesByName || []).length,
      searchedName: fullName, // Include this for debugging/verification
    });
  } catch (error) {
    console.error("getUserCertificatesByNameAndId error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};