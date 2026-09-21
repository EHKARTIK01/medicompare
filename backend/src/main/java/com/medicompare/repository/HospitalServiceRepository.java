package com.medicompare.repository;

import com.medicompare.entity.HospitalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface HospitalServiceRepository extends JpaRepository<HospitalService, Long> {

    List<HospitalService> findByHospitalId(Long hospitalId);

    @Query("""
           select hs from HospitalService hs
           join fetch hs.hospital h
           join hs.medicalService ms
           where lower(ms.name) = lower(:serviceName)
             and (:city is null or lower(h.city) = lower(:city))
           order by hs.price asc
           """)
    List<HospitalService> findForComparison(@Param("serviceName") String serviceName,
                                             @Param("city") String city);

    Optional<HospitalService> findByHospitalIdAndMedicalServiceId(Long hospitalId, Long medicalServiceId);
}
