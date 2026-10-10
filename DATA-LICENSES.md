# Data and asset licenses

## Original application code

The original application code is licensed under the MIT License in [`LICENSE`](LICENSE). This license does not relicense data, game images, animations, audio, original game text, fonts, icons, or other third-party material included in the repository.

## Wiki-derived data

All pet records in [`data/pets.json`](data/pets.json)—including names, Pokédex numbers, evolution families, stages, egg groups, egg-weight boundaries, and attributes—are generated from the `Catalog.lua` snapshot in [JayeGT002/rocom-wiki-data](https://github.com/JayeGT002/rocom-wiki-data). The conversion is reproducible with [`scripts/import_wiki_data.py`](scripts/import_wiki_data.py); it reuses the upstream Lua parser and egg-group names. The generator records the source commit, catalog path, and catalog SHA-256 in `metadata.source`.

The upstream repository declares Wiki-derived data and derivative content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Attributes are normalized by removing the trailing `系`; interval counts and the app's difficulty tier are derived values. The source and license are recorded in `data/pets.json`.

Attribution: 洛克王国世界 WIKI contributors; data compilation: JayeGT002, [Rocom Wiki Data](https://github.com/JayeGT002/rocom-wiki-data). These Wiki-derived values are not covered by this repository's MIT License. Redistribution and adaptations must retain attribution and use CC BY-SA 4.0; commercial use is permitted under that license's terms.

The [rocom WIKI homepage](https://wiki.biligame.com/rocom/%E9%A6%96%E9%A1%B5) still displays CC BY-NC-SA 4.0, while the current [nrc WIKI site declaration](https://wiki.biligame.com/nrc/%E6%B4%9B%E5%85%8B%E7%8E%8B%E5%9B%BD%E4%B8%96%E7%95%8C:%E7%AB%99%E7%82%B9%E5%A3%B0%E6%98%8E) states CC BY-SA 4.0 for original text and authorized data. These are the old and current sites of the same WIKI. The maintained Rocom Wiki Data dataset and this app follow the current declaration for WIKI-derived data. When adding data directly from a WIKI page, retain that page's attribution; game and third-party media are excluded from the WIKI license.

## Game materials and third-party material

Game images, animations, audio, and original game text included in this project are used only to better present game reference material. Their copyrights belong to 魔方工作室群、洛克王国世界项目组及其关联公司、组织. They are not covered by the root MIT License or the WIKI data license. Text written by WIKI contributors remains subject to the license declared by its source page. Other third-party components, color mappings, and icons are listed in [`ui-draft/THIRD-PARTY-NOTICES.md`](ui-draft/THIRD-PARTY-NOTICES.md).

The card avatars for 不咕钟 and 森豆丁 use the `image.head` assets from the upstream pet catalog: [PetAvatar 3616.png](https://wiki.biligame.com/nrc/index.php?title=%E6%96%87%E4%BB%B6%3APetAvatar_3616.png) and [PetAvatar 3749.png](https://wiki.biligame.com/nrc/index.php?title=%E6%96%87%E4%BB%B6%3APetAvatar_3749.png). They were retrieved through the BWIKI MediaWiki API as 128 × 128 PNGs and converted to WebP at quality 95. The previously used `PetPortrait_*.png` files are `image.illustration` assets categorized by BWIKI as 精灵立绘, so they were replaced. BWIKI hosts these game assets; it does not change their copyright status, and they remain outside the MIT and Wiki data licenses.
