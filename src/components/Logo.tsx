import { APP_NAME } from '../data';

/** Puffy, toasted-bread wordmark. */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }} aria-label={APP_NAME} role="img">
      <span aria-hidden="true">{APP_NAME}</span>
    </span>
  );
}
