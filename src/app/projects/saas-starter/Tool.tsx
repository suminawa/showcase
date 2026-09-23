"use client";

/*
 * 額（ブラウザの窓の形をした枠）と、その中の道すじです。
 *
 * 中身はすべてこのタブのメモリの中にあります ── 通信は 1 本もしません。
 * fetch も XMLHttpRequest も sendBeacon も呼ばず、localStorage にも書きません。
 * 読み込み直せば、はじめの見本に戻ります。
 */
import { useEffect, useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { isLang, t, type Lang } from "./kit/src/core/i18n";
import { LegalScreen } from "./demo/LegalScreen";
import { messagesFor } from "./demo/messages";
import { routePath, type Route } from "./demo/paths";
import {
  AppShell,
  BillingScreen,
  CheckoutScreen,
  LoginScreen,
  OrganizationScreen,
  OverviewScreen,
  PortalScreen,
  ProjectsScreen,
  SettingsNav,
  type ScreenProps,
} from "./demo/screens";
import { loadView, type View } from "./demo/view";
import { DEMO_SITE_ORIGIN, DemoWorld } from "./demo/world";
import f from "./saas-starter.module.css";

/** 窓の住所に出す名前（http:// は落として、見た目だけ整えます） */
const HOST = DEMO_SITE_ORIGIN.replace(/^https?:\/\//, "");

const subscribeNothing = (): (() => void) => () => {};

/** ?lang=en で開かれたときは英語から始めます（ご提案に添える URL 用です） */
function readUrlLang(): Lang {
  const found = new URLSearchParams(window.location.search).get("lang");
  return isLang(found) ? found : "ja";
}

function readServerLang(): Lang {
  return "ja";
}

export function Tool(): ReactNode {
  const personId = useId();
  const langLabelId = useId();

  const [world, setWorld] = useState(() => new DemoWorld());
  const [route, setRoute] = useState<Route>({ name: "login" });
  const [view, setView] = useState<View | null>(null);
  const [revision, setRevision] = useState(0);

  const urlLang = useSyncExternalStore(subscribeNothing, readUrlLang, readServerLang);
  const [chosenLang, setChosenLang] = useState<Lang | null>(null);
  const lang = chosenLang ?? urlLang;
  const messages = messagesFor(lang);

  useEffect(() => {
    let alive = true;
    void loadView(world, lang).then((next) => {
      if (alive) setView(next);
    });
    return () => {
      alive = false;
    };
  }, [world, lang, revision]);

  function reset(): void {
    setWorld(new DemoWorld());
    setRoute({ name: "login" });
    setView(null);
    setRevision(0);
  }

  async function choosePerson(userId: string): Promise<void> {
    if (userId === "") {
      await world.signOut();
      setRoute({ name: "login" });
    } else if (await world.signInAs(userId)) {
      setRoute({ name: "overview" });
    }
    setRevision((count) => count + 1);
  }

  // 入っていらっしゃらないあいだは、どの道すじでもログインの画面にお戻しします
  const here: Route = view === null || view.ctx === null ? { name: "login" } : route;

  const props: ScreenProps = {
    view: view ?? {
      demoUsers: [],
      user: null,
      ctx: null,
      organizations: [],
      projects: [],
      quota: null,
      members: [],
      invitations: null,
      billing: null,
    },
    messages,
    lang,
    world,
    route: here,
    refresh: () => setRevision((count) => count + 1),
    go: setRoute,
  };

  function inside(): ReactNode {
    if (view === null) {
      return <p className={f.booting}>{t(messages, "common.loading")}</p>;
    }
    if (here.name === "login") return <LoginScreen {...props} />;
    if (here.name === "legal") {
      return (
        <LegalScreen
          lang={lang}
          messages={messages}
          onBack={() => setRoute({ name: "billing" })}
        />
      );
    }
    if (here.name === "checkout") return <CheckoutScreen {...props} planId={here.planId} />;
    if (here.name === "portal") return <PortalScreen {...props} />;

    return (
      <AppShell {...props}>
        {here.name === "projects" ? <ProjectsScreen {...props} /> : null}
        {here.name === "overview" ? <OverviewScreen {...props} /> : null}
        {here.name === "organization" || here.name === "billing" ? (
          <>
            <SettingsNav {...props} />
            {here.name === "organization" ? <OrganizationScreen {...props} /> : null}
            {here.name === "billing" ? <BillingScreen {...props} /> : null}
          </>
        ) : null}
      </AppShell>
    );
  }

  return (
    <div className={f.frame}>
      <div className={f.chrome}>
        <div className={f.bar}>
          <span className={f.dots} aria-hidden="true">
            <span className={f.dot} />
            <span className={f.dot} />
            <span className={f.dot} />
          </span>
          <span className={f.address} aria-label={t(messages, "demo.chrome.address")}>
            {HOST}
            {routePath(here)}
          </span>
        </div>

        <div className={f.controls}>
          <div className={f.control}>
            <label className={f.controlLabel} htmlFor={personId}>
              {t(messages, "demo.chrome.person")}
            </label>
            <select
              id={personId}
              className={f.select}
              value={view?.user?.id ?? ""}
              onChange={(event) => void choosePerson(event.currentTarget.value)}
            >
              <option value="">{t(messages, "demo.chrome.personNone")}</option>
              {(view?.demoUsers ?? []).map((demoUser) => (
                <option key={demoUser.id} value={demoUser.id}>
                  {demoUser.name}
                </option>
              ))}
            </select>
          </div>

          <div className={f.control} role="group" aria-labelledby={langLabelId}>
            <span className={f.controlLabel} id={langLabelId}>
              {t(messages, "demo.chrome.lang")}
            </span>
            <button
              type="button"
              className={f.toggle}
              aria-pressed={lang === "ja"}
              onClick={() => setChosenLang("ja")}
            >
              {t(messages, "lang.ja")}
            </button>
            <button
              type="button"
              className={f.toggle}
              aria-pressed={lang === "en"}
              onClick={() => setChosenLang("en")}
            >
              {t(messages, "lang.en")}
            </button>
          </div>

          <button type="button" className={f.reset} onClick={reset}>
            {t(messages, "demo.chrome.reset")}
          </button>
        </div>
      </div>

      <div className={f.window}>{inside()}</div>
    </div>
  );
}
