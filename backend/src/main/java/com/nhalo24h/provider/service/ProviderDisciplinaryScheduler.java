package com.nhalo24h.provider.service;

import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ProviderDisciplinaryScheduler {

    private static final Logger log = LoggerFactory.getLogger(ProviderDisciplinaryScheduler.class);
    private final ProviderProfileRepository providerProfileRepository;

    public ProviderDisciplinaryScheduler(ProviderProfileRepository providerProfileRepository) {
        this.providerProfileRepository = providerProfileRepository;
    }

    /**
     * Chạy định kỳ mỗi 30 phút để quét và gỡ đình chỉ cho các thợ đã mãn hạn phạt.
     */
    @Scheduled(fixedRate = 1800000)
    @Transactional
    public void autoLiftExpiredSuspensions() {
        Instant now = Instant.now();
        List<ProviderProfile> allProfiles = providerProfileRepository.findAll();
        int liftedCount = 0;

        for (ProviderProfile profile : allProfiles) {
            if (profile.getSuspendedUntil() != null && now.isAfter(profile.getSuspendedUntil())) {
                log.info("Thợ ID: {} đã mãn hạn đình chỉ nhận việc (Hạn: {}). Hệ thống tự động gỡ án phạt.", 
                        profile.getId(), profile.getSuspendedUntil());
                profile.setSuspendedUntil(null);
                providerProfileRepository.save(profile);
                liftedCount++;
            }
        }

        if (liftedCount > 0) {
            log.info("Đã hoàn tất gỡ đình chỉ kỷ luật cho {} thợ đối tác.", liftedCount);
        }
    }
}
