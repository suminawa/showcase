const ja = {
  meta: {
    title: "間取りシミュレーター",
    description: "間取りを描きかえ、家具を置き、3D で確かめる。マス目を塗るだけで廊下も L 字も描ける、住まいの検討用の道具。",
  },
  title: "間取りシミュレーター",
  lede: "マス目を塗って間取りを描き、置いた家具はそのまま 3D に映ります",
  how: "3D のデータは読み込まず、間取りはマス目の表、家具は箱の一覧という 2 つの表から組み立てています。変更はお使いのブラウザにだけ保存し、サーバーには送りません。",
  kit: "この間取りシミュレーターを自分のサイトに置ける版（¥9,800 の買い切り。建具・収納・寸法・家具の実寸つき）",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Floor Plan Simulator",
      description: "Redraw the floor plan, place furniture, and check it in 3D. Paint grid squares to draw hallways and L-shaped rooms. A tool for planning a home.",
    },
    title: "Floor Plan Simulator",
    lede: "Paint grid squares to draw the plan, and the furniture you place appears in 3D",
    how: "No 3D model files are loaded: the scene is built from two tables, a grid for the floor plan and a list of boxes for the furniture. Changes are saved only in your browser and never sent to a server.",
    kit: "A version of this floor plan simulator for your own site (¥9,800, one-time purchase; includes doors and windows, storage, dimensions, and true-to-size furniture)",
  },
  fr: {
    meta: {
      title: "Simulateur de plan",
      description: "Redessinez le plan, placez les meubles et vérifiez en 3D. Coloriez les cases de la grille pour tracer couloirs et pièces en L. Un outil pour préparer un logement.",
    },
    title: "Simulateur de plan",
    lede: "Coloriez les cases pour dessiner le plan ; les meubles placés apparaissent en 3D",
    how: "Aucun fichier 3D n’est chargé : la scène est construite à partir de deux tableaux, une grille pour le plan et une liste de boîtes pour les meubles. Les modifications sont enregistrées uniquement dans votre navigateur, jamais envoyées à un serveur.",
    kit: "Une version de ce simulateur pour votre propre site (9 800 ¥, achat unique ; avec portes et fenêtres, rangements, cotes et meubles aux dimensions réelles)",
  },
};
