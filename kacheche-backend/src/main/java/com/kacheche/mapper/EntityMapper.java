package com.kacheche.mapper;

import com.kacheche.entity.BaseEntity;

/**
 * Conversion générique Request -> Entity -> Response.
 */
public interface EntityMapper<E extends BaseEntity, Q, S> {

    E toEntity(Q request);

    S toResponse(E entity);
}
