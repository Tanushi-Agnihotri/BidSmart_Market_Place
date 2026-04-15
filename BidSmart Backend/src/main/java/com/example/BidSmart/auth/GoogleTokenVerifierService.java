package com.example.BidSmart.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.BidSmart.exception.ApiException;

@Service
public class GoogleTokenVerifierService {

    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final boolean enabled;
    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleTokenVerifierService(@Value("${app.google.client-id:}") String clientId) {
        this.enabled = clientId != null && !clientId.isBlank();
    }

    /**
     * Exchanges a Google OAuth2 access token for the user's profile.
     * Returns a record with the verified Google user identity (sub, email, name, email_verified).
     */
    public GoogleUserInfo verify(String accessToken) {
        if (!enabled) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                "Google Sign-In is not configured on the server");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                USERINFO_URL,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                GoogleUserInfo.class
            );

            GoogleUserInfo body = response.getBody();
            if (body == null || body.sub() == null || body.email() == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
            }
            return body;
        } catch (RestClientException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Could not verify Google token");
        }
    }

    public record GoogleUserInfo(
        String sub,
        String email,
        Boolean email_verified,
        String name,
        String picture
    ) {
    }
}
