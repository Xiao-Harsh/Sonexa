package com.musicapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class AudiusNetworkException extends RuntimeException {
    public AudiusNetworkException(String message) {
        super(message);
    }

    public AudiusNetworkException(String message, Throwable cause) {
        super(message, cause);
    }
}
