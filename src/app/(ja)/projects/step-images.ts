import type { KitStepImage } from "./kit-parts";

/** つまずきやすい手順の図（30days/scripts/step-images.mjs で作る。字が日本語なので日本語のページだけに置く） */
export const STEP_IMAGES = {
  gasAuth: {
    src: "/guides/steps/gas-auth.png",
    alt: "初めて動かすときの承認の 4 つの画面。1「承認が必要です」で「権限を確認」、2 ご自身のアカウントを選ぶ、3「このアプリは Google で確認されていません」で小さな「詳細」から「（プロジェクト名）（安全ではないページ）に移動」、4 許可の一覧を確かめて「許可」",
    width: 2560,
    height: 1600,
  },
  apiKey: {
    src: "/guides/steps/api-key.png",
    alt: "Anthropic の API キーとカードの登録の 4 つの手順。1 console.anthropic.com でアカウントを作る、2 Settings の Billing でカードを登録、3 Limits の Spend limit で月の上限、4 API Keys の Create Key でキーを作り、表示は 1 度だけなのですぐコピー",
    width: 2560,
    height: 1600,
  },
} satisfies Record<string, KitStepImage>;
