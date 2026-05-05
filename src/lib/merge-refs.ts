export function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined | null)[]
): React.RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        (ref as (instance: T | null) => void)(value);
      } else if (ref && typeof ref === "object") {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}