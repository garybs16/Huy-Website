import { useEffect, useRef } from "react";

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
const scriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise;

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(window.turnstile), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function isTurnstileEnabled() {
  return Boolean(siteKey);
}

export function TurnstileWidget({ onToken, onExpire, onError, resetSignal }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onToken, onExpire, onError });

  useEffect(() => {
    callbacksRef.current = { onToken, onExpire, onError };
  }, [onToken, onExpire, onError]);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !turnstile || !containerRef.current || widgetIdRef.current !== null) {
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => callbacksRef.current.onToken?.(token),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
          "error-callback": () => callbacksRef.current.onError?.(),
        });
      })
      .catch(() => callbacksRef.current.onError?.());

    return () => {
      cancelled = true;

      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="turnstile-field">
      <div ref={containerRef} />
    </div>
  );
}
