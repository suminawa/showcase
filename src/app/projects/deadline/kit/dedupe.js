// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 同じ日に同じ行を二度通知しないための鍵。
 * 件名・期限・担当がすべて同じなら同じ行とみなす（行を並べ替えても効く。期限を直せばまた通知される）。
 */

/** 行を表す鍵 */
export function rowKeyOf(item) {
  return item.subject + "@" + item.dueKey + "@" + item.assignee;
}

/** 保存する鍵: <行の鍵>|<バケット>|<実行日> */
export function dedupeKeyOf(item, bucket, runDate) {
  return rowKeyOf(item) + "|" + bucket + "|" + runDate;
}

/**
 * 送信済みの鍵を取り除く。
 * 返り値: { sections: 残った節（空の節は落とす）, keys: 今回送る鍵 }
 */
export function removeSent(sections, sentKeys, runDate) {
  const sent = {};
  for (let i = 0; i < sentKeys.length; i += 1) sent[sentKeys[i]] = true;

  const keys = [];
  const kept = [];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const items = [];
    for (let j = 0; j < section.items.length; j += 1) {
      const item = section.items[j];
      const key = dedupeKeyOf(item, section.bucket, runDate);
      if (Object.prototype.hasOwnProperty.call(sent, key)) continue;
      if (keys.indexOf(key) >= 0) continue;
      keys.push(key);
      items.push(item);
    }
    if (items.length > 0) kept.push({ bucket: section.bucket, heading: section.heading, items: items });
  }
  return { sections: kept, keys: keys };
}

/** 保存領域の名前。日付ごとに 1 つだけ持つ */
export function storeNameOf(runDate) {
  return "sent:" + runDate;
}

/** 実行日以外の保存領域（消してよいもの）の名前を返す */
export function staleStoreNames(propertyNames, runDate) {
  const keep = storeNameOf(runDate);
  const stale = [];
  for (let i = 0; i < propertyNames.length; i += 1) {
    const name = propertyNames[i];
    if (String(name).indexOf("sent:") === 0 && name !== keep) stale.push(name);
  }
  return stale;
}
