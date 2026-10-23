/*
 * 検索の言葉「給与明細 メール 配布」「給与明細 PDF 個別 送信」の着地の紙。
 * 紙で配る手間 → 電子で配る前の承諾（所得税法第 231 条）→ 無料で配る方法 → 比べる表 → 送り間違いを防ぐ →
 * データの置き場所 → キット → 設置を頼む、の順に読ませる。
 * キットの事実と比べる相手の費用は ops 30days/products/payslip-delivery-gas/booth-description.md（10/22 に確かめた値）だけから取る。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ContactMail } from "@/components/track/ContactMail";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { GuideArticle, GuideCompare, GuideLinks, guideMetadata } from "../parts";

const guide = guideBySlug("payslip-email");

const SHOT = "/projects/payslip/pdf.png";
const NTA_QA = "https://www.nta.go.jp/publication/pamph/hotei/denshikofu-qa/answer.htm";
const COCONALA = "https://coconala.com/services/4465831";
const FROM = "/guides/payslip-email";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function PayslipEmailGuide() {
  return (
    <GuideArticle guide={guide} image={SHOT}>
      <section className={g.section}>
        <h2 className={g.heading}>給与明細を紙で配っていると、何が手間ですか</h2>
        <ul className={g.list}>
          <li>毎月、全員分を印刷して封筒に入れ、手渡しの日に休んでいる人の分を取っておく</li>
          <li>現場や在宅の人がいると、手渡しのために別の日に会うか、郵送することになる</li>
          <li>「先月の明細をなくした」と言われるたびに、探して印刷し直す</li>
        </ul>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>給与明細をメールで配る前に、何が要りますか</h2>
        <p className={g.text}>
          給与の支払明細書は、所得税法第 231
          条で、給与を受け取る方に交付することとされています。書面で渡すのが元の形で、メールや PDF
          のような電子の形で渡すには、受け取る方の承諾を得ることとされています（同条第 2
          項）。いまは、あらかじめ電子で渡すことを知らせ、期限までに返事が無ければ承諾があったとみなす扱いもあります。
        </p>
        <ul className={g.list}>
          <li>承諾は社員ごとに取り、いつ承諾を得たかを名簿に残す</li>
          <li>承諾しない方、メールを持っていない方には、これまでどおり紙で渡す</li>
          <li>手続きの細かいところは国税庁の Q&amp;A を読み、最後は顧問の税理士・社労士に確かめる</li>
        </ul>
        <p className={g.text}>
          国税庁の資料:{" "}
          <a href={NTA_QA} className={g.link} rel="noopener noreferrer">
            源泉徴収票等の電子交付に関する Q&amp;A
          </a>
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>無料で配るには、どうしますか</h2>
        <p className={g.text}>
          給与の計算を社労士や Excel で済ませていて、明細だけを配っているなら、費用をかけずに次の形で配れます。
        </p>
        <ol className={g.list}>
          <li>
            <b>1 人ずつ PDF にして、手でメールに添付する</b>: Excel やスプレッドシートの明細を 1 人分ずつ PDF
            に書き出し、ファイル名に社員番号と月を入れて、本人のアドレスへ 1 通ずつ送ります。
          </li>
          <li>
            <b>宛先は名簿から写す</b>: アドレスは毎回手で打たず、名簿の「社員番号・氏名・アドレス」から貼ります。送る前に、PDF
            の社員番号と宛先の社員番号が合っているかを 1 人ずつ確かめます。
          </li>
          <li>
            <b>送った記録を残す</b>: 誰に・いつ・どのアドレスへ送ったかを、名簿の隣の列に書きます。「届いていない」と言われたときに、送ったかどうかをすぐ確かめられます。
          </li>
        </ol>
        <p className={g.text}>
          PDF にパスワードを付けて、パスワードを同じ相手に別のメールで送る方法もありますが、宛先を間違えれば両方が同じ人に届きます。守りの中心は、宛先を間違えないことに置きます。
        </p>
        <p className={g.text}>
          freee人事労務やマネーフォワード クラウド給与のように、Web 明細の付いた給与ソフトをすでにお使いなら、配る仕組みもそちらに入っています。新しく道具を足す前に、契約の中身を確かめてください。
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>紙・手でメール・Web 明細・キットは、何が違いますか</h2>
        <GuideCompare
          rows={[
            {
              way: "印刷して手渡し",
              cost: "紙と封筒の代",
              fits: "全員が同じ場所で働いていて、人数が少ない",
              limit: "毎月の印刷と封入の手間。休みの人・在宅の人に渡しにくい",
            },
            {
              way: "1 人ずつ PDF にして手でメール",
              cost: "0 円",
              fits: "5 人ほどまでで、毎月確かめる時間を取れる",
              limit: "人数が増えるほど宛先の取り違えが怖い。送った記録を自分で残す",
            },
            {
              way: "給与ソフトに付いた Web 明細",
              cost: "給与ソフトの契約に含まれる",
              fits: "給与計算もそのソフトで行っている",
              limit: "給与計算を社労士や Excel で済ませていると、明細のために契約を足すことになる",
            },
            {
              way: "Web 給与明細の専用サービス",
              cost: "1 人あたり月 40〜220 円ほど（初期費用が別のものもある）",
              fits: "社員のログイン画面や、明細の長い保存まで任せたい",
              limit: "人数が増えるほど月々の費用が増える",
            },
          ]}
          kit={{
            way: "payslip",
            fits: "社労士の一覧の形のまま取り込み、本人だけに配りたい（従業員 5〜30 人ほど）",
            limit: "給与と税の計算はしない。Google スプレッドシートとドライブを使う。1 つのシートで 150 人ほどまで",
          }}
          note="ほかの方法の費用は、2026 年 10 月 22 日に各社のページで確かめたものです。"
        />
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>送り間違いと漏れは、どう防ぎますか</h2>
        <ul className={g.list}>
          <li>送る前に、社員番号と氏名が名簿と合うか、同じアドレスが 2 人に入っていないか、差引支給額が空やマイナスでないかを確かめる</li>
          <li>全員に送る前に、自分あてに 1 通だけ試しに送り、宛先と PDF の組み合わせを目で確かめる</li>
          <li>メールの本文には金額を書かない。開くのは PDF だけにする</li>
          <li>同じ月の明細を同じ人に 2 回送らない。送り直すときは、その人だけを選んで送る</li>
          <li>退職した人に共有していた明細は、退職の日に共有を外す</li>
        </ul>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>給与のデータは、どこに置かれますか</h2>
        <p className={g.text}>
          給与は、社員の方がいちばん外に出てほしくない情報です。下のキットでは、給与の一覧と明細の PDF は、お使いの Google
          アカウントのスプレッドシートとドライブだけに置かれます。作者のサーバーは通らず、作者を含めほかの人が見ることはありません。
        </p>
        <ul className={g.list}>
          <li>スプレッドシートは、そのファイルだけを読み書きします</li>
          <li>ドライブは、キットが作ったフォルダとファイルだけを扱います</li>
          <li>メールは、試し送りと配るときだけ、ご自身のアカウントから送ります</li>
          <li>動かすコードは、すべて zip の中でお読みいただけます</li>
        </ul>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>給与明細 配布キットでは、何ができますか</h2>
        <p className={g.text}>
          社労士や給与ソフトから届いた給与の一覧を Google スプレッドシートに貼ると、社員ごとの A4 の明細 PDF
          を作り、本人のアドレスだけに渡します。2 段の見出しや結合セル、全角の数字が混ざった一覧もそのまま取り込めます。渡し方は、本人のアドレスだけに PDF
          を共有してリンクを知らせる形（既定）と、PDF をメールに添付する形の 2 つです。
        </p>
        <ul className={g.list}>
          <li>「確かめる」が、送る前に 11 の点を調べます。要確認が 1 つでもあると、試し送りも配るもできません</li>
          <li>試し送りを済ませるまで、その月の「配る」は押せません</li>
          <li>電子交付の同意日を社員ごとに持ち、同意日が空の方には送らず、紙で渡す人としてお名前を出します</li>
          <li>いつ・誰に・どのアドレスへ・どの渡し方で送ったかを「送信記録」に残します</li>
        </ul>
        <figure className={g.figure}>
          <Link href="/projects/payslip">
            <Image
              src={SHOT}
              alt="給与明細 配布キットで作った A4 の明細 PDF と、スマートフォンのブラウザで開いたところ"
              width={2560}
              height={1600}
            />
          </Link>
          <figcaption className={g.caption}>
            見本の会社の 8 人分で作った明細です ──{" "}
            <Link href="/projects/payslip" className={g.link}>
              給与明細 配布キットのページを開く
            </Link>
          </figcaption>
        </figure>
        <p className={g.text}>
          価格は本体が ¥3,480、顧問先に設置して渡せる社労士・制作会社用が ¥9,800 です（どちらも税込・買い切り）。社員 3
          人まで・ご自身あての試し送りまでの{" "}
          <a href={goHref("payslip-lite", "booth", FROM)} rel="nofollow" className={g.link}>
            無料版
          </a>
          で、お手元の一覧が取り込めるかを先に確かめられます。 ──{" "}
          <a href={goHref("payslip", "booth", FROM)} rel="nofollow" className={g.link}>
            BOOTH
          </a>
          {" / "}
          <a href={goHref("payslip", "note", FROM)} rel="nofollow" className={g.link}>
            note
          </a>
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>設置まで頼めますか</h2>
        <p className={g.text}>
          <a href={COCONALA} className={g.link}>
            ココナラ
          </a>
          で、設置込みのご依頼もできます。御社の一覧の形に合うかどうかのご相談は、 <ContactMail className={g.link} />{" "}
          へお送りください。3 営業日以内に返信します。
        </p>
      </section>
      <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
