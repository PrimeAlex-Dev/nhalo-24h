package com.nhalo24h.storage.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String storeFile(MultipartFile file, String subFolder);
    List<String> storeFiles(List<MultipartFile> files, String subFolder);
    void deleteFile(String fileUrl);
}
