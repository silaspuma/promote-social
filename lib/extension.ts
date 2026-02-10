// Extension communication utilities

export interface ExtensionStatus {
  installed: boolean;
  version?: string;
}

export interface TokenResponse {
  success: boolean;
  token?: string;
  tokenData?: any;
  expiresAt?: number;
  error?: string;
}

// Check if extension is installed
export function checkExtensionInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    let responded = false;

    // Listen for extension response
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'PROMOTE_SOCIAL_EXTENSION_INSTALLED') {
        responded = true;
        window.removeEventListener('message', messageHandler);
        resolve(true);
      }
    };

    window.addEventListener('message', messageHandler);

    // Request extension status
    window.postMessage({ type: 'CHECK_EXTENSION_INSTALLED' }, '*');

    // Timeout after 1 second
    setTimeout(() => {
      if (!responded) {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }
    }, 1000);
  });
}

// Request completion token from extension
export function requestCompletionToken(
  taskId: string,
  userId: string
): Promise<TokenResponse> {
  return new Promise((resolve) => {
    const requestId = `token_${Date.now()}_${Math.random()}`;
    let responded = false;

    // Listen for token response
    const messageHandler = (event: MessageEvent) => {
      if (
        event.data.type === 'COMPLETION_TOKEN_RESPONSE' &&
        event.data.requestId === requestId
      ) {
        responded = true;
        window.removeEventListener('message', messageHandler);
        resolve(event.data.data);
      }
    };

    window.addEventListener('message', messageHandler);

    // Request token
    window.postMessage(
      {
        type: 'REQUEST_COMPLETION_TOKEN',
        data: {
          taskId,
          userId,
          siteUrl: window.location.origin,
        },
        requestId,
      },
      '*'
    );

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!responded) {
        window.removeEventListener('message', messageHandler);
        resolve({
          success: false,
          error: 'Extension did not respond',
        });
      }
    }, 5000);
  });
}

// Listen for when user returns from external site
export function onUserReturn(callback: () => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data.type === 'USER_RETURNED_TO_SITE') {
      callback();
    }
  };

  window.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handler);
  };
}
