/*
 * React の <ViewTransition>（Next.js の App Router が束ねる React canary にある）。
 * @types/react にはまだ型が無いので、ここで足す（2026-10-07）。
 * 仕様: https://react.dev/reference/react/ViewTransition
 */
import "react";

declare module "react" {
  type ViewTransitionClassValue = "none" | "auto" | (string & {});
  type ViewTransitionClass = ViewTransitionClassValue | Record<string, ViewTransitionClassValue>;
  interface ViewTransitionProps {
    name?: string;
    children?: ReactNode;
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }
  export function ViewTransition(props: ViewTransitionProps): ReactNode;
}
