type Config = { [key: string]: any }

export const config: Config = {
  app: {
    machineName: "topelius",
    projectId: 10,
    apiEndpoint: "https://api.sls.fi/digitaledition",
    simpleApi: '',
    i18n: {
      languages: [
        { code: "sv", label: "Svenska" },
        { code: "fi", label: "Suomi" }
      ],
      enableLanguageChanges: true,
      multilingualCollectionTableOfContents: false,
      multilingualReadingTextLanguages: []
    },
  },
  collections: {
    order: [
      [216, 219, 220, 218, 210, 208, 207, 214, 203, 213,
        202, 199, 221, 206, 201, 211, 200, 205, 215, 217,
        204, 212, 209]
    ],
    firstReadItem: {
      216: "216_20280", 219: "219_19443", 220: "220_20122",
      218: "218_20230_ch2", 210: "210_20548_ch1", 208: "208_18466_ch4",
      207: "207_18464_ch1", 214: "214_20240_ch1", 203: "203_20217_ch1",
      213: "213_18465_ch1", 202: "202_18467_ch1", 199: "199_18284",
      221: "221_21422", 206: "206_20212_ch1", 201: "201_18471",
      211: "211_20128", 200: "200_19870", 205: "205_20227_ch1",
      215: "215_20568", 217: "217_20559_ch1", 204: "204_20322",
      212: "212_20323", 209: "209_20479"
    }
  },
  page: {
    about: {
      markdownFolderNumber: "03",
      initialPageNode: "01-01"
    },
    home: {
      imageOrientationIsPortrait: true,
      imageOnRightIfPortrait: false,
      siteTitleOnTopOfImageInMobileModeIfPortrait: false,
      imageUrl: "assets/images/frontpage-image-portrait.jpg",
      portraitImageUrlInMobileMode: "assets/images/frontpage-image-square.jpg",
      portraitImageAltText: "Zacharias Topelius",
      showEditionList: false,
      showFooter: true
    },
    epub: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    foreword: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    introduction: {
      hasSeparateTOC: true,
      showURNButton: true,
      showViewOptionsButton: true
    },
    mediaCollection: {
      showURNButton: true
    },
    read: {
      showURNButton: true,
      showViewOptionsButton: true,
      viewTypeSettings: {
        showAll: true,
        established: true,
        comments: true,
        manuscripts: true,
        variations: true,
        facsimiles: true,
        illustrations: true,
        legend: true
      }
    },
    title: {
      showURNButton: true,
      showViewOptionsButton: true
    }
  },
  component: {
    topMenu: {
      showAboutButton: true,
      showContentButton: true,
      showElasticSearchButton: true,
      showURNButton: false,
      showLanguageButton: true,
      showSiteLogo: true,
      siteLogoDefaultImageUrl: "assets/images/logo.svg",
      siteLogoMobileImageUrl: "assets/images/logo-mobile.svg",
      siteLogoLinkUrl: "https://www.sls.fi/"
    },
    sideMenu: {
      sortableCollectionsAlphabetic: ["211", "215", "219", "220"],
      sortableCollectionsChronologic: ["215", "219", "220"],
      sortableCollectionsGenre: []
    }
  },
  urnResolverUrl: "https://urn.fi/",
  useSimpleWorkMetadata: true,
  showOpenLegendButton: {
    manuscripts: true,
    variations: true
  },
  settings: {
    disableReadToggles: false,
    readToggles: {
      comments: true,
      personInfo: true,
      placeInfo: true,
      changes: true,
      normalisations: true,
      workInfo: true,
      abbreviations: true,
      paragraphNumbering: true,
      pageBreakOriginal: true,
      pageBreakEdition: true
    },
    introToggles: {
      personInfo: true,
      placeInfo: false,
      workInfo: true,
      paragraphNumbering: true,
      pageBreakEdition: true
    },
    toolTips: {
      comments: true,
      personInfo: true,
      placeInfo: true,
      changes: true,
      normalisations: true,
      variations: true,
      abbreviations: true,
      workInfo: true,
      footNotes: true
    },
    enableModeToggle: true,
    getFacsimilePagesInfinite: true,
    facsimileDefaultZoomLevel: 4,
    facsimileZoomPageLevel: 1,
    galleryCollectionMapping: { 214: 44, 206: 19 },
    showReadTextIllustrations: ["20212", "20213", "206"]
  },
  collectionDownloads: {
    isDownloadOnly: false,
    pdf: {},
    epub: {}
  },
  textDownloadOptions: {
    enabledIntroductionFormats: {
        xml: true,
        print: true
    },
    enabledEstablishedFormats: {
        xml: true,
        txt: false,
        print: true
    },
    enabledCommentsFormats: {
        xml: true,
        txt: false,
        print: true
    },
    usePrintNotDownloadIcon: false
  },
  simpleSearch: {
    showPageNumbers: false,
    user_defined_search_fields: ["textData"]
  },
  editionImages: {
    default: "assets/images/edition-default-cover.jpg",
    199: "assets/images/verk/omslag/omslag_199_ljungblommor.jpg",
    200: "assets/images/verk/omslag/omslag_200_nya_blad_och_ljung.jpg",
    201: "assets/images/verk/omslag/omslag_201_noveller.jpg",
    202: "assets/images/verk/omslag/omslag_202_hertiginnan_af_finland.jpg",
    203: "assets/images/verk/omslag/omslag_203_faltskarns_berattelser.jpg",
    204: "assets/images/verk/omslag/omslag_204_vinterqvallar.jpg",
    205: "assets/images/verk/omslag/omslag_205_planeternas_skyddslingar.jpg",
    206: "assets/images/verk/omslag/omslag_206_naturens_bok_och_boken_om_vart_land.jpg",
    207: "assets/images/verk/omslag/omslag_207_finland_framstalldt_i_teckningar.jpg",
    208: "assets/images/verk/omslag/omslag_208_en_resa_i_finland.jpg",
    209: "assets/images/verk/omslag/omslag_209_ovrig_lyrik.jpg",
    210: "assets/images/verk/omslag/omslag_210_dramatik.jpg",
    211: "assets/images/verk/omslag/omslag_211_noveller_och_kortprosa.jpg",
    212: "assets/images/verk/omslag/omslag_212_ovrig_barnlitteratur.jpg",
    213: "assets/images/verk/omslag/omslag_213_forelasningar.jpg",
    214: "assets/images/verk/omslag/omslag_214_finland_i_19de_seklet.jpg",
    215: "assets/images/verk/omslag/omslag_215_publicistik.jpg",
    216: "assets/images/verk/omslag/omslag_216_academica.jpg",
    217: "assets/images/verk/omslag/omslag_217_religiosa_skrifter_och_psalmer.jpg",
    218: "assets/images/verk/omslag/omslag_218_dagbocker.jpg",
    219: "assets/images/verk/omslag/omslag_219_forlagskorrespondens.jpg",
    220: "assets/images/verk/omslag/omslag_220_foraldrakorrespondens.jpg",
    221: "assets/images/verk/omslag/omslag_221_lasning_for_barn.jpg"
  },
  show: {
    TOC: {
      Home: false,
      About: true,
      Read: true,
      Facsimiles: false,
      ImageGallery: false,
      PersonSearch: true,
      PlaceSearch: true,
      MediaCollections: true,
      TagSearch: false,
      WorkSearch: false,
      Books: false,
      EPUB: true
    },
    highlightedSearchMatches: true
  },
  defaults: {
    ReadModeView: ["established", "comments", "facsimiles"]
  },
  defaultSelectedItem: "cover",
  cache: {
    viewmodes: {
      daysUntilExpires: 1
    }
  },
  PersonSearchTypes: [{
    object_type: "subject",
    object_subtype: "",
    translation: "TOC.PersonSearch"
  }],
  PersonSearch: {
    ShowFilter: true,
    ShowPublishedStatus: 2,
    InitialLoadNumber: 500
  },
  LocationSearch: {
    ShowFilter: false,
    ShowPublishedStatus: 2,
    InitialLoadNumber: 500
  },
  TagSearch: {
    ShowFilter: false,
    ShowPublishedStatus: 2
  },
  ImageGallery: {
    ShowInReadMenu: false
  },
  Occurrences: {
    HideTypeAndDescription: true,
    hideCityRegionCountry: true,
    ShowPublishedStatus: 2
  },
  StaticPagesMenus: [{
    menuID: "aboutMenu",
    idNumber: "03",
    hasMenuConditional: false
  }],
  StaticPagesMenusInTOC: [{
    menuID: "aboutMenu",
    idNumber: "03",
    hasMenuConditional: false
  }],
  LoadCollectionsFromAssets: false,
  ProjectStaticMarkdownCoversFolder: "08",
  ProjectStaticMarkdownTitleFolder: "",
  showOccurencesModalOnReadPageAfterSearch: {
    tagSearch: true,
    personSearch: true,
    placeSearch: true,
    workSearch: true
  },
  SortCollectionsByRomanNumerals: false,
  AccordionTOC: true,
  OpenCollectionFromToc: true,
  SearchTocItemInAccordionByTitle: false,
  AboutMenuAccordion: true,
  HasCover: true,
  HasTitle: true,
  HasForeword: true,
  HasIntro: true,
  OpenOccurrencesAndInfoOnNewPage: false,
  SingleOccurrenceType: null,
  ElasticSearch: {
    show: {
      sortOptions: true,
      facets: true
    },
    textTitleHighlightType: "fvh",
    textHighlightType: "fvh",
    groupOpenByDefault: {
      type: true,
      genre: true,
      collection: true
    },
    indices: ["topelius"],
    fixedFilters: [
      {
        terms: {
          deleted: ["0"]
        }
      },
      {
        terms: {
          published: ["2"]
        }
      }
    ],
    types: ["est", "com", "var", "inl", "tit", "fore"],
    hitsPerPage: 15,
    source: [],
    aggregations: {
      Years: {
        date_histogram: {
          field: "orig_date_sort",
          calendar_interval: "year",
          format: "yyyy"
        }
      },
      Type: {
        terms: {
          field: "text_type",
          size: 40
        }
      },
      Genre: {
        terms: {
          field: "publication_data.genre.keyword",
          size: 40
        }
      },
      Collection: {
        terms: {
          field: "publication_data.collection_name.keyword",
          size: 40
        }
      },
      LetterSenderName: {
        terms: {
          field: "sender_subject_name.keyword",
          size: 100
        }
      },
      LetterReceiverName: {
        terms: {
          field: "receiver_subject_name.keyword",
          size: 100
        }
      },
      LetterSenderLocation: {
        terms: {
          field: "sender_location_name.keyword",
          size: 50
        }
      },
      LetterReceiverLocation: {
        terms: {
          field: "receiver_location_name.keyword",
          size: 50
        }
      }
    },
    suggestions: {}
  },
  siteMetaData: {
    keywords: "Zacharias Topelius Skrifter, digital edition, digital utgåva",
    description: "En textkritisk, kommenterad utgåva av Zacharias Topelius (1818–1898) författarskap",
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "topelius.sls.fi",
      alternateName: "Zacharias Topelius Skrifter",
      url: "https://topelius.sls.fi",
      sameAs: ["http://www.topelius.fi", "http://topelius.sls.fi"]
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      url: "https://topelius.sls.fi",
      logo: "https://topelius.sls.fi/assets/images/logo.svg"
    }
  },
  AvailableEpubs: [
    {
      title: "Dummy epub",
      filename: "2685.epub",
      download: "https://www.sls.fi/",
      cover: "",
      id: "2685.epub"
    },{
      title: "Another dummy epub",
      filename: "285.epub",
      download: "https://www.sls.fi/",
      cover: "",
      id: "285.epub",
    }
  ]
}

/**
 * This is the config for soderholm.sls.fi, here only for testing purposes.
 */
export const config_soderholm: Config = {
  app: {
    machineName: "soderholm",
    projectId: 7,
    apiEndpoint: "https://api.sls.fi/digitaledition",
    simpleApi: '',
    i18n: {
      languages: [
        { code: "sv", label: "Svenska" }
      ],
      enableLanguageChanges: false,
      multilingualCollectionTableOfContents: false,
      multilingualReadingTextLanguages: []
    },
  },
  collections: {
    order: [
      [378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 
        393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 
        408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 
        423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 
        438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 
        453, 454, 455, 456, 540, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466,
        467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 1084, 480,
        481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495,
        496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 511,
        512, 510, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525,
        526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536],  
      [2559], 
      [1646, 1699, 1701, 1747, 1702, 1703, 1704, 1726, 1705, 1714, 1706, 1707,
        1715, 1721, 1716, 1717, 1718, 1708, 1722, 1749, 1742, 1719, 1748, 1731,
        1746, 1745, 1720, 1743, 1752, 1711, 1710, 1712, 1727, 1713, 1709, 1700,
        1751, 1739, 1738, 1741, 1723, 1724, 1725, 1737, 1740, 1750, 1729, 1732,
        1733, 1734, 1735, 1736]
    ],
    firstReadItem: {
      1084: "1084_77105", 1699: "1699_77946", 1700: "1700_78162",
      1701: "1701_78326", 1702: "1702_78404", 1703: "1703_78486",
      1704: "1704_78634", 1705: "1705_78754", 1706: "1706_78908",
      1707: "1707_79024", 1708: "1708_79144", 1709: "1709_79356",
      1710: "1710_79428", 1711: "1711_79514", 1712: "1712_79620",
      1713: "1713_79722", 1714: "1714_79750", 1715: "1715_79828",
      1716: "1716_79976", 1717: "1717_80096", 1718: "1718_80294",
      1719: "1719_80348", 1720: "1720_80372", 1721: "1721_80400",
      1722: "1722_80468", 1723: "1723_80534", 1724: "1724_80542",
      1725: "1725_80574", 1726: "1726_80722", 1727: "1727_80760",
      1729: "1729_80764", 1731: "1731_80768", 1732: "1732_80772",
      1733: "1733_80778", 1734: "1734_80790", 1735: "1735_80840",
      1736: "1736_81008", 1737: "1737_81304", 1738: "1738_81334",
      1739: "1739_81348", 1740: "1740_81372", 1741: "1741_81390",
      1742: "1742_81414", 1743: "1743_81488", 1745: "1745_81624",
      1746: "1746_81628", 1747: "1747_81634", 1748: "1748_81692",
      1749: "1749_81726", 1750: "1750_81735", 1751: "1751_81921",
      1752: "1752_81940", 2559: "2559_84260", 378: "378_24876",
      379: "379_24826", 380: "380_24152", 381: "381_24900",
      382: "382_24262", 383: "383_24482", 384: "384_26616",
      385: "385_26618", 386: "386_26600", 387: "387_26606",
      388: "388_26608", 389: "389_24484", 390: "390_26614",
      391: "391_24488", 392: "392_26612", 393: "393_24490",
      394: "394_24492", 395: "395_24480", 396: "396_24478",
      397: "397_24464", 398: "398_24466", 399: "399_24468",
      400: "400_24470", 401: "401_24472", 402: "402_24494",
      403: "403_24496", 404: "404_24498", 405: "405_25006",
      406: "406_26564", 407: "407_25146", 408: "408_26050",
      409: "409_26210", 410: "410_25356", 411: "411_24696",
      412: "412_26610", 413: "413_25470", 414: "414_27097",
      415: "415_27089", 416: "416_25594", 417: "417_26428",
      418: "418_27388", 419: "419_27386", 420: "420_24500",
      421: "421_25738", 422: "422_27099", 423: "423_26843",
      424: "424_27372", 425: "425_27093", 426: "426_27124",
      427: "427_27107", 428: "428_27362", 429: "429_27109",
      430: "430_27111", 431: "431_27376", 432: "432_27113",
      433: "433_27115", 434: "434_27119", 435: "435_26620",
      436: "436_27126", 437: "437_27128", 438: "438_27130",
      439: "439_27132", 440: "440_27134", 441: "441_27136",
      442: "442_27138", 443: "443_27140", 444: "444_27142",
      445: "445_27144", 446: "446_27160", 447: "447_27146",
      448: "448_27148", 449: "449_27150", 450: "450_27152",
      451: "451_27156", 452: "452_27154", 453: "453_27158",
      454: "454_27198", 455: "455_27200", 456: "456_27202",
      457: "457_27208", 458: "458_27210", 459: "459_27212",
      460: "460_27214", 461: "461_27206", 462: "462_27216",
      463: "463_27218", 464: "464_27220", 465: "465_27222",
      466: "466_27228", 467: "467_27230", 468: "468_27232",
      469: "469_27234", 470: "470_27236", 471: "471_27238",
      472: "472_27240", 473: "473_27242", 474: "474_27244",
      475: "475_27246", 476: "476_27248", 477: "477_27254",
      478: "478_27252", 479: "479_27256", 480: "480_27250",
      481: "481_27384", 482: "482_27258", 483: "483_27380",
      484: "484_27260", 485: "485_27382", 486: "486_27264",
      487: "487_27103", 488: "488_27105", 489: "489_27266",
      490: "490_27268", 491: "491_26326", 492: "492_27270",
      493: "493_27272", 494: "494_27274", 495: "495_27360",
      496: "496_27276", 497: "497_27364", 498: "498_27278",
      499: "499_27282", 500: "500_27284", 501: "501_27286",
      502: "502_27288", 503: "503_27290", 504: "504_27294",
      505: "505_27292", 506: "506_27296", 507: "507_27298",
      508: "508_27300", 509: "509_27302", 510: "510_27308",
      511: "511_27304", 512: "512_27312", 513: "513_27314",
      514: "514_27316", 515: "515_27318", 516: "516_27320",
      517: "517_27322", 518: "518_27324", 519: "519_27326",
      520: "520_27328", 521: "521_27330", 522: "522_27336",
      523: "523_27338", 524: "524_27340", 525: "525_27342",
      526: "526_27344", 527: "527_27346", 528: "528_27348",
      529: "529_27350", 530: "530_27354", 531: "531_27356",
      532: "532_27358", 533: "533_26046", 534: "534_26048",
      535: "535_27366", 536: "536_27368", 540: "540_37812"
    }
  },
  page: {
    about: {
      markdownFolderNumber: "03",
      initialPageNode: "01-01"
    },
    home: {
      imageOrientationIsPortrait: false,
      imageOnRightIfPortrait: false,
      siteTitleOnTopOfImageInMobileModeIfPortrait: false,
      imageUrl: "assets/images/frontpage-image-portrait.jpg",
      portraitImageUrlInMobileMode: "assets/images/frontpage-image-square.jpg",
      portraitImageAltText: "",
      showEditionList: false,
      showFooter: false
    },
    epub: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    foreword: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    introduction: {
      hasSeparateTOC: true,
      showURNButton: true,
      showViewOptionsButton: true
    },
    mediaCollection: {
      showURNButton: true
    },
    read: {
      showURNButton: true,
      showViewOptionsButton: true,
      viewTypeSettings: {
        showAll: false,
        established: false,
        comments: false,
        manuscripts: true,
        variations: false,
        facsimiles: true,
        illustrations: false,
        legend: false
      },
    },
    title: {
      showURNButton: true,
      showViewOptionsButton: true
    }
  },
  component: {
    topMenu: {
      showAboutButton: true,
      showContentButton: true,
      showElasticSearchButton: true,
      showURNButton: false,
      showLanguageButton: false,
      showSiteLogo: true,
      siteLogoDefaultImageUrl: "assets/images/logo.svg",
      siteLogoMobileImageUrl: "assets/images/logo-mobile.svg",
      siteLogoLinkUrl: "https://www.sls.fi/"
    },
    sideMenu: {
      sortableCollectionsAlphabetic: [],
      sortableCollectionsChronologic: [],
      sortableCollectionsGenre: []
    }
  },
  urnResolverUrl: "https://urn.fi/",
  useSimpleWorkMetadata: false,
  showOpenLegendButton: {
    manuscripts: false,
    variations: false
  },
  settings: {
    disableReadToggles: false,
    readToggles: {
      comments: false,
      personInfo: false,
      placeInfo: false,
      changes: false,
      normalisations: false,
      workInfo: false,
      abbreviations: false,
      paragraphNumbering: false,
      pageBreakOriginal: false,
      pageBreakEdition: false
    },
    introToggles: {
      personInfo: false,
      placeInfo: false,
      workInfo: false,
      paragraphNumbering: false,
      pageBreakEdition: false
    },
    toolTips: {
        comments: false,
        personInfo: false,
        placeInfo: false,
        changes: false,
        normalisations: false,
        variations: false,
        abbreviations: false,
        workInfo: false,
        footNotes: false
    },
    enableModeToggle: true,
    getFacsimilePagesInfinite: true,
    facsimileDefaultZoomLevel: 2,
    facsimileZoomPageLevel: 2,
    galleryCollectionMapping: {},
    showReadTextIllustrations: []
  },
  collectionDownloads: {
    isDownloadOnly: false,
    pdf: {},
    epub: {}
  },
  textDownloadOptions: {
    enabledIntroductionFormats: {
        xml: false,
        print: false
    },
    enabledEstablishedFormats: {
        xml: false,
        txt: false,
        print: false
    },
    enabledCommentsFormats: {
        xml: false,
        txt: false,
        print: false
    },
    usePrintNotDownloadIcon: false
  },
  simpleSearch: {
    showPageNumbers: false,
    user_defined_search_fields: ["textData"]
  },
  editionImages: {
    default: "assets/images/parmbilder/white.jpg",
    1084:"assets/images/parmbilder/1084.jpg",
    378:"assets/images/parmbilder/378.jpg",
    379:"assets/images/parmbilder/379.jpg",
    380:"assets/images/parmbilder/380.jpg",
    381:"assets/images/parmbilder/381.jpg",
    382:"assets/images/parmbilder/382.jpg",
    383:"assets/images/parmbilder/383.jpg",
    384:"assets/images/parmbilder/384.jpg", 
    385:"assets/images/parmbilder/385.jpg",
    386:"assets/images/parmbilder/386.jpg",
    387:"assets/images/parmbilder/387.jpg",
    388:"assets/images/parmbilder/388.jpg",
    389:"assets/images/parmbilder/389.jpg",
    390:"assets/images/parmbilder/390.jpg",
    391:"assets/images/parmbilder/391.jpg",
    392:"assets/images/parmbilder/392.jpg",
    393:"assets/images/parmbilder/393.jpg",
    394:"assets/images/parmbilder/394.jpg",
    395:"assets/images/parmbilder/395.jpg",
    396:"assets/images/parmbilder/396.jpg",
    397:"assets/images/parmbilder/397.jpg",
    398:"assets/images/parmbilder/398.jpg",
    399:"assets/images/parmbilder/399.jpg",
    400:"assets/images/parmbilder/400.jpg",
    401:"assets/images/parmbilder/401.jpg",
    402:"assets/images/parmbilder/402.jpg",
    403:"assets/images/parmbilder/403.jpg",
    404:"assets/images/parmbilder/404.jpg",
    405:"assets/images/parmbilder/405.jpg",
    406:"assets/images/parmbilder/406.jpg",
    407:"assets/images/parmbilder/407.jpg",
    408:"assets/images/parmbilder/408.jpg",
    409:"assets/images/parmbilder/409.jpg",
    410:"assets/images/parmbilder/410.jpg",
    411:"assets/images/parmbilder/411.jpg",
    412:"assets/images/parmbilder/412.jpg",
    413:"assets/images/parmbilder/413.jpg",
    414:"assets/images/parmbilder/414.jpg",
    415:"assets/images/parmbilder/415.jpg",
    416:"assets/images/parmbilder/416.jpg",
    417:"assets/images/parmbilder/417.jpg",
    418:"assets/images/parmbilder/418.jpg",
    419:"assets/images/parmbilder/419.jpg",
    420:"assets/images/parmbilder/420.jpg",
    421:"assets/images/parmbilder/421.jpg",
    422:"assets/images/parmbilder/422.jpg",
    423:"assets/images/parmbilder/423.jpg",
    424:"assets/images/parmbilder/424.jpg",
    425:"assets/images/parmbilder/425.jpg",
    426:"assets/images/parmbilder/426.jpg",
    427:"assets/images/parmbilder/427.jpg",
    428:"assets/images/parmbilder/428.jpg",
    429:"assets/images/parmbilder/429.jpg",
    430:"assets/images/parmbilder/430.jpg",
    431:"assets/images/parmbilder/431.jpg",
    432:"assets/images/parmbilder/432.jpg",
    433:"assets/images/parmbilder/433.jpg",
    434:"assets/images/parmbilder/434.jpg",
    435:"assets/images/parmbilder/435.jpg",
    436:"assets/images/parmbilder/436.jpg",
    437:"assets/images/parmbilder/437.jpg",
    438:"assets/images/parmbilder/438.jpg",
    439:"assets/images/parmbilder/439.jpg",
    440:"assets/images/parmbilder/440.jpg",
    441:"assets/images/parmbilder/441.jpg",
    442:"assets/images/parmbilder/442.jpg",
    443:"assets/images/parmbilder/443.jpg",
    444:"assets/images/parmbilder/444.jpg",
    445:"assets/images/parmbilder/445.jpg",
    446:"assets/images/parmbilder/446.jpg",
    447:"assets/images/parmbilder/447.jpg",
    448:"assets/images/parmbilder/448.jpg",
    449:"assets/images/parmbilder/449.jpg",
    450:"assets/images/parmbilder/450.jpg",
    451:"assets/images/parmbilder/451.jpg",
    452:"assets/images/parmbilder/452.jpg",
    453:"assets/images/parmbilder/453.jpg",
    454:"assets/images/parmbilder/454.jpg",
    455:"assets/images/parmbilder/455.jpg",
    456:"assets/images/parmbilder/456.jpg",
    457:"assets/images/parmbilder/457.jpg",
    458:"assets/images/parmbilder/458.jpg",
    459:"assets/images/parmbilder/459.jpg",
    460:"assets/images/parmbilder/460.jpg",
    461:"assets/images/parmbilder/461.jpg",
    462:"assets/images/parmbilder/462.jpg",
    463:"assets/images/parmbilder/463.jpg",
    464:"assets/images/parmbilder/464.jpg",
    465:"assets/images/parmbilder/465.jpg",
    466:"assets/images/parmbilder/466.jpg",
    467:"assets/images/parmbilder/467.jpg",
    468:"assets/images/parmbilder/468.jpg",
    469:"assets/images/parmbilder/469.jpg",
    470:"assets/images/parmbilder/470.jpg",
    471:"assets/images/parmbilder/471.jpg",
    472:"assets/images/parmbilder/472.jpg",
    473:"assets/images/parmbilder/473.jpg",
    474:"assets/images/parmbilder/474.jpg",
    475:"assets/images/parmbilder/475.jpg",
    476:"assets/images/parmbilder/476.jpg",
    477:"assets/images/parmbilder/477.jpg",
    478:"assets/images/parmbilder/478.jpg",
    479:"assets/images/parmbilder/479.jpg",
    480:"assets/images/parmbilder/480.jpg",
    481:"assets/images/parmbilder/481.jpg",
    482:"assets/images/parmbilder/482.jpg",
    483:"assets/images/parmbilder/483.jpg",
    484:"assets/images/parmbilder/484.jpg",
    485:"assets/images/parmbilder/485.jpg",
    486:"assets/images/parmbilder/486.jpg",
    487:"assets/images/parmbilder/487.jpg",
    488:"assets/images/parmbilder/488.jpg",
    489:"assets/images/parmbilder/489.jpg",
    490:"assets/images/parmbilder/490.jpg",
    491:"assets/images/parmbilder/491.jpg",
    492:"assets/images/parmbilder/492.jpg",
    493:"assets/images/parmbilder/493.jpg",
    494:"assets/images/parmbilder/494.jpg",
    495:"assets/images/parmbilder/495.jpg",
    496:"assets/images/parmbilder/496.jpg",
    497:"assets/images/parmbilder/497.jpg",
    498:"assets/images/parmbilder/498.jpg",
    499:"assets/images/parmbilder/499.jpg",
    500:"assets/images/parmbilder/500.jpg",
    501:"assets/images/parmbilder/501.jpg",
    502:"assets/images/parmbilder/502.jpg",
    503:"assets/images/parmbilder/503.jpg",
    504:"assets/images/parmbilder/504.jpg",
    505:"assets/images/parmbilder/505.jpg",
    506:"assets/images/parmbilder/506.jpg",
    507:"assets/images/parmbilder/507.jpg",
    508:"assets/images/parmbilder/508.jpg",
    509:"assets/images/parmbilder/509.jpg",
    510:"assets/images/parmbilder/510.jpg",
    511:"assets/images/parmbilder/511.jpg",
    512:"assets/images/parmbilder/512.jpg",
    513:"assets/images/parmbilder/513.jpg",
    514:"assets/images/parmbilder/514.jpg",
    515:"assets/images/parmbilder/515.jpg",
    516:"assets/images/parmbilder/516.jpg",
    517:"assets/images/parmbilder/517.jpg",
    518:"assets/images/parmbilder/518.jpg",
    519:"assets/images/parmbilder/519.jpg",
    520:"assets/images/parmbilder/520.jpg",
    521:"assets/images/parmbilder/521.jpg",
    522:"assets/images/parmbilder/522.jpg",
    523:"assets/images/parmbilder/523.jpg",
    524:"assets/images/parmbilder/524.jpg",
    525:"assets/images/parmbilder/525.jpg",
    526:"assets/images/parmbilder/526.jpg",
    527:"assets/images/parmbilder/527.jpg",
    528:"assets/images/parmbilder/528.jpg",
    529:"assets/images/parmbilder/529.jpg",
    530:"assets/images/parmbilder/530.jpg",
    531:"assets/images/parmbilder/531.jpg",
    532:"assets/images/parmbilder/532.jpg",
    533:"assets/images/parmbilder/533.jpg",
    534:"assets/images/parmbilder/534.jpg",
    535:"assets/images/parmbilder/535.jpg",
    536:"assets/images/parmbilder/536.jpg",
    540:"assets/images/parmbilder/540.jpg",
    2559:"assets/images/parmbilder/2559.jpg",
    1699:"assets/images/parmbilder/1699.jpg",
    1701:"assets/images/parmbilder/1701.jpg",
    1747:"assets/images/parmbilder/1747.jpg",
    1702:"assets/images/parmbilder/1702.jpg",
    1703:"assets/images/parmbilder/1703.jpg",
    1704:"assets/images/parmbilder/1704.jpg",
    1726:"assets/images/parmbilder/1726.jpg",
    1705:"assets/images/parmbilder/1705.jpg",
    1714:"assets/images/parmbilder/1714.jpg",
    1706:"assets/images/parmbilder/1706.jpg",
    1707:"assets/images/parmbilder/1707.jpg",
    1715:"assets/images/parmbilder/1715.jpg",
    1721:"assets/images/parmbilder/1721.jpg",
    1716:"assets/images/parmbilder/1716.jpg",
    1717:"assets/images/parmbilder/1717.jpg",
    1718:"assets/images/parmbilder/1718.jpg",
    1708:"assets/images/parmbilder/1708.jpg",
    1722:"assets/images/parmbilder/1722.jpg",
    1749:"assets/images/parmbilder/1749.jpg",
    1742:"assets/images/parmbilder/1742.jpg",
    1719:"assets/images/parmbilder/1719.jpg",
    1748:"assets/images/parmbilder/1748.jpg",
    1731:"assets/images/parmbilder/1731.jpg",
    1746:"assets/images/parmbilder/1746.jpg",
    1745:"assets/images/parmbilder/1745.jpg",
    1720:"assets/images/parmbilder/1720.jpg",
    1743:"assets/images/parmbilder/1743.jpg",
    1752:"assets/images/parmbilder/1752.jpg",
    1711:"assets/images/parmbilder/1711.jpg",
    1710:"assets/images/parmbilder/1710.jpg",
    1712:"assets/images/parmbilder/1712.jpg",
    1727:"assets/images/parmbilder/1727.jpg",
    1713:"assets/images/parmbilder/1713.jpg",
    1709:"assets/images/parmbilder/1709.jpg",
    1700:"assets/images/parmbilder/1700.jpg",
    1751:"assets/images/parmbilder/1751.jpg",
    1739:"assets/images/parmbilder/1739.jpg",
    1738:"assets/images/parmbilder/1738.jpg",
    1741:"assets/images/parmbilder/1741.jpg",
    1723:"assets/images/parmbilder/1723.jpg",
    1724:"assets/images/parmbilder/1724.jpg",
    1725:"assets/images/parmbilder/1725.jpg",
    1737:"assets/images/parmbilder/1737.jpg",
    1740:"assets/images/parmbilder/1740.jpg",
    1750:"assets/images/parmbilder/1750.jpg",
    1729:"assets/images/parmbilder/1729.jpg",
    1732:"assets/images/parmbilder/1732.jpg",
    1733:"assets/images/parmbilder/1733.jpg",
    1734:"assets/images/parmbilder/1734.jpg",
    1735:"assets/images/parmbilder/1735.jpg",
    1736:"assets/images/parmbilder/1736.jpg"
  },
  show: {
    TOC: {
      Home: true,
      About: true,
      Read: true,
      Facsimiles: false,
      ImageGallery: false,
      PersonSearch: true,
      PlaceSearch: false,
      MediaCollections: false,
      TagSearch: false,
      WorkSearch: false,
      Books: false,
      EPUB: true
    },
    highlightedSearchMatches: true
  },
  defaults: {
    ReadModeView: ["facsimiles", "manuscripts"]
  },
  defaultSelectedItem: "cover",
  cache: {
    viewmodes: {
      daysUntilExpires: 1
    }
  },
  PersonSearchTypes: [{
    object_type: "subject",
    object_subtype: "",
    translation: "TOC.PersonSearch"
  }],
  PersonSearch: {
    ShowFilter: false,
    ShowPublishedStatus: 2,
    InitialLoadNumber: 500
  },
  LocationSearch: {
    ShowFilter: false,
    ShowPublishedStatus: 2,
    InitialLoadNumber: 500
  },
  TagSearch: {
    ShowFilter: false,
    ShowPublishedStatus: 2
  },
  ImageGallery: {
    ShowInReadMenu: false
  },
  Occurrences: {
    HideTypeAndDescription: true,
    hideCityRegionCountry: true,
    ShowPublishedStatus: 2
  },
  StaticPagesMenus: [{
    menuID: "aboutMenu",
    idNumber: "03",
    hasMenuConditional: false
  }],
  StaticPagesMenusInTOC: [{
    menuID: "aboutMenu",
    idNumber: "03",
    hasMenuConditional: false
  }],
  LoadCollectionsFromAssets: false,
  ProjectStaticMarkdownCoversFolder: "08",
  ProjectStaticMarkdownTitleFolder: "05",
  showOccurencesModalOnReadPageAfterSearch: {
    tagSearch: true,
    personSearch: true,
    placeSearch: true,
    workSearch: true
  },
  SortCollectionsByRomanNumerals: false,
  AccordionTOC: true,
  OpenCollectionFromToc: true,
  SearchTocItemInAccordionByTitle: false,
  AboutMenuAccordion: true,
  HasCover: false,
  HasTitle: false,
  HasForeword: false,
  HasIntro: false,
  OpenOccurrencesAndInfoOnNewPage: false,
  SingleOccurrenceType: null,
  ElasticSearch: {
    show: {
      sortOptions: false,
      facets: true
    },
    textTitleHighlightType: "fvh",
    textHighlightType: "fvh",
    groupOpenByDefault: {
      type: true,
      genre: false,
      collection: true
    },
    indices: ["soderholm"],
    fixedFilters: [
      {
        terms: {
          deleted: ["0"]
        }
      },
      {
        terms: {
          published: ["2"]
        }
      }
    ],
    types: ["ms"],
    hitsPerPage: 15,
    source: [],
    aggregations: {
      Type: {
        terms: {
          field: "text_type",
          size: 40
        }
      },
      Collection: {
        terms: {
          field: "publication_data.collection_name.keyword",
          size: 40
        }
      }
    },
    suggestions: {}
  },
  AvailableEpubs: [
    {
      title: "Dagböcker",
      filename: "soderholm_dagbocker.epub",
      download: "https://www.sls.fi/sv/utgivning/kerstin-soderholms-dagbocker",
      cover: "/assets/images/parmbilder/Kerstin-Soderholms-dagbocker-cover-web.jpg",
      id: "soderholm_dagbocker.epub"
    }
  ],
  siteMetaData: {
    keywords: "Kerstin Söderholm, Digital Edition",
    description: "Kerstin Söderholms dagböcker och arkiv",
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "soderholm.sls.fi",
      alternateName: "Kerstin Söderholm",
      url: "https://soderholm.sls.fi",
      sameAs: ["http://soderholm.sls.fi", ""]
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      url:"https://soderholm.sls.fi",
      logo:"https://soderholm.sls.fi/assets/images/logo.svg"
    }
  }
}

/**
 * This is the config for leomechelin.fi, here only for testing purposes.
 */
export const config_mechelin: Config = {
  app: {
    machineName: "leomechelin",
    projectId: 1,
    apiEndpoint: "https://api-dot-leomechelin.ew.r.appspot.com/digitaledition",
    simpleApi: "https://leomechelin.ew.r.appspot.com",
    facsimileBase: "https://leomechelin-facsimiles.storage.googleapis.com/facsimile_collection",
    i18n: {
      languages: [
        { code: "sv", label: "Svenska" },
        { code: "fi", label: "Suomi" }
      ],
      enableLanguageChanges: true,
      multilingualCollectionTableOfContents: true,
      multilingualReadingTextLanguages: ["sv", "fi"]
    }
  },
  collections: {
    order: [
      [1, 2, 3, 4, 5, 6, 7, 8 ,9]
    ],
    firstReadItem: {
      1: "1_1199"
    }
  },
  page: {
    about: {
      markdownFolderNumber: "03",
      initialPageNode: "01-01"
    },
    home: {
      imageOrientationIsPortrait: false,
      imageOnRightIfPortrait: false,
      siteTitleOnTopOfImageInMobileModeIfPortrait: false,
      imageUrl: "https://leomechelin.fi/assets/images/MECHELIN_Aloituskuva_kevyempi.jpg",
      portraitImageUrlInMobileMode: "",
      portraitImageAltText: "",
      showEditionList: false,
      showFooter: false
    },
    epub: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    foreword: {
      showURNButton: true,
      showViewOptionsButton: true
    },
    introduction: {
      hasSeparateTOC: true,
      showURNButton: true,
      showViewOptionsButton: true
    },
    mediaCollection: {
      showURNButton: true
    },
    read: {
      showURNButton: true,
      showViewOptionsButton: true,
      viewTypeSettings: {
        showAll: true,
        established: true,
        comments: false,
        manuscripts: true,
        variations: false,
        facsimiles: true,
        illustrations: false,
        legend: false
      },
    },
    title: {
      showURNButton: true,
      showViewOptionsButton: true
    }
  },
  component: {
    topMenu: {
      showAboutButton: true,
      showContentButton: true,
      showElasticSearchButton: false,
      showURNButton: false,
      showLanguageButton: true,
      showSiteLogo: false,
      siteLogoDefaultImageUrl: "assets/images/logo.svg",
      siteLogoMobileImageUrl: "assets/images/logo-mobile.svg",
      siteLogoLinkUrl: ""
    },
    sideMenu: {
      sortableCollectionsAlphabetic: [],
      sortableCollectionsChronologic: ["1"],
      sortableCollectionsGenre: ["1"]
    }
  },
  urnResolverUrl: "https://urn.fi/",
  useSimpleWorkMetadata: false,
  showOpenLegendButton: {
    manuscripts: true,
    variations: true
  },
  settings: {
    disableReadToggles: false,
    readToggles: {
      comments: true,
      personInfo: true,
      placeInfo: false,
      changes: true,
      normalisations: true,
      workInfo: false,
      abbreviations: true,
      paragraphNumbering: false,
      pageBreakOriginal: true,
      pageBreakEdition: false
    },
    introToggles: {
      personInfo: false,
      placeInfo: false,
      workInfo: false,
      paragraphNumbering: false,
      pageBreakEdition: false
    },
    toolTips: {
      comments: true,
      personInfo: true,
      placeInfo: false,
      changes: true,
      normalisations: true,
      variations: false,
      abbreviations: true,
      workInfo: false,
      footNotes: true
    },
    enableModeToggle: true,
    getFacsimilePagesInfinite: true,
    facsimileDefaultZoomLevel: 1,
    facsimileZoomPageLevel: 1,
    galleryCollectionMapping: {},
    showReadTextIllustrations: []
  },
  collectionDownloads: {
    isDownloadOnly: false,
    pdf: {},
    epub: {}
  },
  textDownloadOptions: {
    enabledIntroductionFormats: {
        xml: false,
        print: false
    },
    enabledEstablishedFormats: {
        xml: false,
        txt: false,
        print: false
    },
    enabledCommentsFormats: {
        xml: false,
        txt: false,
        print: false
    },
    usePrintNotDownloadIcon: false
  },
  simpleSearch: {
    showPageNumbers: false,
    user_defined_search_fields: []
  },
  editionImages: {
    1: "https://leomechelin.fi/assets/images/løvenskiold_cover.jpg",
    default: "assets/images/edition-default-cover.png"
  },
  show: {
    TOC: {
      Home: false,
      About: true,
      Read: true,
      Facsimiles: false,
      ImageGallery: false,
      PersonSearch: false,
      PlaceSearch: false,
      MediaCollections: false,
      TagSearch: false,
      WorkSearch: false,
      Books: false,
      EPUB: false,
      ExtraText: true
    }
  },
  defaults: {
      ReadModeView: ["established_sv", "established_fi", "manuscripts", "facsimiles"]
  },
  cache: {
      viewmodes: {
          daysUntilExpires: 2
      }
  },
  PersonSearchTypes: [
    {
        object_type: "subject",
        object_subtype: "",
        translation: "TOC.PersonSearch"
    }
  ],
  PersonSearch: {
      ShowFilter: false,
      ShowPublishedStatus: 2,
      InitialLoadNumber: 500
  },
  LocationSearch: {
      ShowFilter: false,
      ShowPublishedStatus: 2,
      InitialLoadNumber: 500
  },
  TagSearch: {
      ShowFilter: false,
      ShowPublishedStatus: 2
  },
  ImageGallery: {
    ShowInReadMenu: false
  },
  Occurrences: {
      HideTypeAndDescription: true,
      hideCityRegionCountry: true,
      ShowPublishedStatus: 2
  },
  StaticPagesMenus: [
      {
          menuID: "aboutMenu",
          idNumber: "03",
          hasMenuConditional: false
      }
  ],
  StaticPagesMenusInTOC: [
      {
          menuID: "aboutMenu",
          idNumber: "03",
          hasMenuConditional: false
      }
  ],
  LoadCollectionsFromAssets: false,
  ProjectStaticMarkdownCoversFolder: "",
  ProjectStaticMarkdownTitleFolder: "",
  showOccurencesModalOnReadPageAfterSearch: {
    tagSearch: true,
    personSearch: true,
    placeSearch: true,
    workSearch: true
  },
  SortCollectionsByRomanNumerals: false,
  AccordionTOC: true,
  OpenCollectionFromToc: true,
  SearchTocItemInAccordionByTitle: false,
  AboutMenuAccordion: true,
  HasCover: false,
  HasTitle: false,
  HasForeword: false,
  HasIntro: true,
  OpenOccurrencesAndInfoOnNewPage: false,
  SingleOccurrenceType: null,
  ElasticSearch: {
    groupOpenByDefault: {
        type: true,
        genre: true,
        collection: true
    },
    indices: ["leomechelin"],
    fixedFilters: [
      {
        terms: {
          deleted: ["0"]
        }
      },
      {
        terms: {
          published: ["2"]
        }
      }
    ],
    types: ["est","inl","ms"],
    hitsPerPage: 20,
    source: [],
    aggregations: {
      Years: {
        date_histogram: {
          field: "orig_date_sort",
          calendar_interval: "year",
          format: "yyyy"
        }
      },
      Type: {
        terms: {
          field: "xml_type.keyword",
          size: 40
        }
      },
      Genre: {
        terms: {
          field: "publication_data.genre.keyword",
          size: 40
        }
      },
      Collection: {
        terms: {
          field: "publication_data.colname.keyword",
          size: 40
        }
      },
      Subjects: {
        terms: {
          field: "publication_subjects.full_name.keyword",
          size: 40
        }
      },
      Person: {
        terms: {
          field: "publication_subjects.full_name.keyword",
          size: 40
        }
      },
      LetterSenderName: {
        terms: {
          field: "sender_subject_name.keyword",
          size: 40
        }
      },
      LetterReceiverName: {
        terms: {
          field: "receiver_subject_name.keyword",
          size: 40
        }
      },
      LetterSenderLocation: {
        terms: {
          field: "sender_location_name.keyword",
          size: 40
        }
      },
      LetterReceiverLocation: {
        terms: {
          field: "receiver_location_name.keyword",
          size: 40
        }
      }
    },
    suggestions: {}
  }
}
