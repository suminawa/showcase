"use client";

/**
 * お申し付けを受けるフォームの入れ物です。キットの app/_components/ActionForm.tsx が手本です。
 *
 * 違うのは、呼ぶ先がサーバーではなく、このタブの中の flow だという 1 点だけです。
 * お返事の形（ActionState）も、誤りの文の引き方も、キットのものをそのまま使います。
 */
import { createContext, useActionState, useContext, type ReactNode } from "react";

import { t, type Messages } from "../kit/src/core/i18n";
import type { FieldError } from "../kit/src/core/validation";
import { IDLE, type ActionState } from "../kit/src/server/context";
import ui from "./ui.module.css";

type FormContextValue = { state: ActionState; messages: Messages };

const FormContext = createContext<FormContextValue | null>(null);

/** 同じフォームの中の部品が、いまのお返事を受け取ります */
export function useActionFormContext(): FormContextValue {
  const found = useContext(FormContext);
  if (found === null) {
    throw new Error("This component must be used inside <ActionForm>.");
  }
  return found;
}

/** その欄に対する誤りだけを取り出します */
export function errorsForField(errors: FieldError[] | undefined, field: string): FieldError[] {
  if (errors === undefined) return [];
  return errors.filter((error) => error.field === field);
}

export type DemoAction = (form: FormData) => Promise<ActionState>;

export type ActionFormProps = {
  action: DemoAction;
  messages: Messages;
  children: ReactNode;
  className?: string;
  /** 読み上げで、このフォームが何のためのものかをお伝えします */
  label?: string;
};

export function ActionForm({
  action,
  messages,
  children,
  className,
  label,
}: ActionFormProps): ReactNode {
  const [state, formAction] = useActionState(
    async (_previous: ActionState, form: FormData) => action(form),
    IDLE,
  );

  return (
    <FormContext.Provider value={{ state, messages }}>
      <form action={formAction} className={className} aria-label={label}>
        <div className={ui.formStatus} role="status" aria-live="polite">
          {state.status === "error" ? (
            <p className={`${ui.notice} ${ui.noticeDanger}`}>{t(messages, state.messageKey)}</p>
          ) : null}
          {state.status === "ok" && state.messageKey !== undefined ? (
            <p className={`${ui.notice} ${ui.noticeOk}`}>{t(messages, state.messageKey)}</p>
          ) : null}
          {state.status === "ok" && state.value !== undefined ? (
            <input
              className={ui.valueBox}
              type="text"
              value={state.value}
              readOnly
              aria-label={t(messages, "common.copyValue")}
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : null}
        </div>
        {children}
      </form>
    </FormContext.Provider>
  );
}
