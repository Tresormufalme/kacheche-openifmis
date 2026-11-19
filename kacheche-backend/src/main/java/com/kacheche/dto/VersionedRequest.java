package com.kacheche.dto;

/**
 * Tout request DTO modifiable doit transporter la version lue par le client.
 * Obligatoire en PUT, ignorée en POST.
 */
public interface VersionedRequest {

    Long version();
}
