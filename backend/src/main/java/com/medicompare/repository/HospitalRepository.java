package com.medicompare.repository;

import com.medicompare.entity.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    @Query("""
           select h from Hospital h
           where (:city is null or lower(h.city) = lower(:city))
             and (:locality is null or lower(h.locality) like lower(concat('%', :locality, '%')))
             and (:query is null or lower(h.name) like lower(concat('%', :query, '%'))
                                 or lower(h.address) like lower(concat('%', :query, '%')))
           """)
    Page<Hospital> search(@Param("city") String city,
                           @Param("locality") String locality,
                           @Param("query") String query,
                           Pageable pageable);

    @Query("""
           select distinct h from Hospital h
           join h.hospitalServices hs
           join hs.medicalService ms
           where lower(ms.name) = lower(:serviceName)
             and (:city is null or lower(h.city) = lower(:city))
           """)
    java.util.List<Hospital> findByServiceName(@Param("serviceName") String serviceName,
                                                @Param("city") String city);
}
