# Data and asset licenses

## Original application code

The original application code is licensed under the MIT License in [`LICENSE`](LICENSE). This license does not relicense data, game images, animations, audio, original game text, fonts, icons, or other third-party material included in the repository.

## Wiki-derived data

The `attributes` field in [`data/pets.json`](data/pets.json) was matched by Pokédex number and name against the published [Rocom Wiki Data dataset](https://github.com/JayeGT002/rocom-wiki-data). That dataset identifies 洛克王国世界 WIKI contributors as the source and declares Wiki-derived data and derivative content under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The values were normalized by removing the `系` suffix. The source and license are recorded in the JSON file's top-level metadata.

Attribution: 洛克王国世界 WIKI contributors; data compilation: JayeGT002, [Rocom Wiki Data](https://github.com/JayeGT002/rocom-wiki-data). These Wiki-derived values are not covered by this repository's MIT License. Their redistribution and adaptations must retain attribution, be non-commercial, and use CC BY-NC-SA 4.0.

License declarations differ across the available WIKI pages: the [rocom WIKI homepage](https://wiki.biligame.com/rocom/%E9%A6%96%E9%A1%B5) and the Rocom Wiki Data dataset declare CC BY-NC-SA 4.0, while the [nrc WIKI site declaration](https://wiki.biligame.com/nrc/%E6%B4%9B%E5%85%8B%E7%8E%8B%E5%9B%BD%E4%B8%96%E7%95%8C:%E7%AB%99%E7%82%B9%E5%A3%B0%E6%98%8E) applies CC BY-SA 4.0 to its original text and authorized data. This application's current attribute values came through the Rocom Wiki Data dataset, so they retain that dataset's declared CC BY-NC-SA 4.0 terms. When adding data directly from a Wiki page, record that exact page and its stated license; the nrc site declaration explicitly excludes game and third-party media.

## Game materials and third-party material

Game images, animations, audio, and original game text included in this project are used only to better present game reference material. Their copyrights belong to 魔方工作室群、洛克王国世界项目组及其关联公司、组织. They are not covered by the root MIT License or the WIKI data license. Text written by WIKI contributors remains subject to the license declared by its source page. Other third-party components, color mappings, and icons are listed in [`ui-draft/THIRD-PARTY-NOTICES.md`](ui-draft/THIRD-PARTY-NOTICES.md).
