package com.example.ComplainSystem.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ComplainSystem.dto.response.AttachmentResponse;
import com.example.ComplainSystem.entity.Attachment;
import com.example.ComplainSystem.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class FileUploadService {

    private static final int MAX_FILES = 5;
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final Cloudinary cloudinary;
    private final AttachmentRepository attachmentRepository;

    public FileUploadService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            AttachmentRepository attachmentRepository) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
        this.attachmentRepository = attachmentRepository;
    }

    /**
     * Validates, uploads, and persists attachments for an issue or comment.
     *
     * @param files      files from the multipart request (may be null/empty)
     * @param issueId    the issue these attachments belong to
     * @param commentId  null if attached to the issue itself
     * @return list of saved AttachmentResponse
     */
    public List<AttachmentResponse> uploadAndSave(List<MultipartFile> files, Long issueId, Long commentId) {
        if (files == null || files.isEmpty()) return List.of();

        List<MultipartFile> nonEmpty = files.stream()
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        if (nonEmpty.isEmpty()) return List.of();
        if (nonEmpty.size() > MAX_FILES)
            throw new RuntimeException("Maximum " + MAX_FILES + " files allowed per submission.");

        List<AttachmentResponse> responses = new ArrayList<>();

        for (MultipartFile file : nonEmpty) {
            validate(file);

            String folder = "resolvehub/issues/" + issueId;
            Map<?, ?> result;
            try {
                boolean isImage = file.getContentType() != null && file.getContentType().startsWith("image/");
                result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", isImage ? "image" : "raw",
                        "use_filename", true,
                        "unique_filename", true
                ));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
            }

            Attachment attachment = Attachment.builder()
                    .issueId(issueId)
                    .commentId(commentId)
                    .url((String) result.get("secure_url"))
                    .publicId((String) result.get("public_id"))
                    .originalName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();

            Attachment saved = attachmentRepository.save(attachment);
            responses.add(toResponse(saved));
        }

        return responses;
    }

    public List<AttachmentResponse> getByIssue(Long issueId) {
        return attachmentRepository.findByIssueIdAndCommentIdIsNull(issueId)
                .stream().map(this::toResponse).toList();
    }

    public List<AttachmentResponse> getByComment(Long commentId) {
        return attachmentRepository.findByCommentId(commentId)
                .stream().map(this::toResponse).toList();
    }

    private void validate(MultipartFile file) {
        if (file.getSize() > MAX_SIZE_BYTES)
            throw new RuntimeException("File '" + file.getOriginalFilename() + "' exceeds the 10 MB size limit.");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct))
            throw new RuntimeException("File type '" + ct + "' is not allowed. Accepted: images, PDF, Word documents.");
    }

    private AttachmentResponse toResponse(Attachment a) {
        return new AttachmentResponse(a.getId(), a.getUrl(), a.getOriginalName(), a.getFileType(), a.getFileSize());
    }
}
