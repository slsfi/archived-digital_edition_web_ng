type Config = { [key: string]: any }

export const config: Config = {
  app: {
    machineName: "topelius",
    projectId: 10,
    apiEndpoint: "https://api.sls.fi/digitaledition",
    simpleApi: '',
    name: {
      sv: "Zacharias Topelius Skrifter",
      fi: "Zacharias Topelius Skrifter",
      en: "Zacharias Topelius Skrifter"
    },
    siteLogoURL: "https://www.sls.fi/",
    CollectionSortOrder: {
      216: 1, 219: 2, 220: 3, 218: 4, 210: 5, 208: 6, 207: 7, 214: 8,
      203: 9, 213: 10, 202: 11, 199: 12, 221: 13,
      206: 14, 201: 15, 211: 16, 200: 17,
      205: 18, 215: 19, 217: 20, 204: 21, 212: 22, 209: 23
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
      showSimpleSearch: false,
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
    music: {
      collectionsToShow: []
    },
    read: {
      showURNButton: true,
      showViewOptionsButton: true
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
      showSimpleSearchButton: false,
      showURNButton: false,
      showLanguageButton: true,
      showMusicButton: false,
      showHelpButton: false
    }
  },
  urnResolverUrl: "https://urn.fi/",
  useSimpleWorkMetadata: true,
  showOpenLegendButton: {
    manuscripts: true,
    variations: true
  },
  showTutorial: false,
  TutorialSteps: [
    {
      id: "welcome",
      intro: "WelcomeText",
      show: true,
      alreadySeen: false,
      hideOn: [],
      showOn: ["HomePage"]
    },
    {
      id: "menuToggle",
      element: "#menuToggle",
      intro: "MenuToggleText",
      show: true,
      alreadySeen: false,
      hideOn: [],
      showOn: ["HomePage"]
    },
    {
      id: "readTocItem",
      element: "#readTocItem",
      intro: "ReadTocItemText",
      show: false,
      alreadySeen: false,
      hideOn: [],
      showOn: []
    },
    {
      id: "downloadPerson",
      element: "#downloadPerson",
      intro: "DownloadCacheText",
      show: false,
      alreadySeen: false,
      hideOn: [],
      showOn: []
    },
    {
      id: "searchIcon",
      element: "#searchIcon",
      intro: "SearchIconText",
      show: true,
      alreadySeen: false,
      hideOn: [],
      showOn: ["HomePage"]
    },
    {
      id: "settings-icon",
      element: "#settings-icon",
      intro: "SettingsIconText",
      show: false,
      alreadySeen: false,
      hideOn: ["HomePage"],
      showOn: ["ReadPage"]
    },
    {
      id: "download-icon",
      element: "#download-icon",
      intro: "DownloadIconText",
      show: false,
      alreadySeen: false,
      hideOn: [],
      showOn: []
    },
    {
      id: "readFabMenu",
      element: "#readFabMenu",
      intro: "FabMenuText",
      show: false,
      alreadySeen: false,
      hideOn: ["HomePage"],
      showOn: ["ReadPage"]
    },
    {
      id: "tabs-text-container",
      element: "#tabs-text-container",
      intro: "TabsTextContainerText",
      show: false,
      alreadySeen: false,
      hideOn: [],
      showOn: []
    },
    {
      id: "facsimilies-image",
      element: "#facsimilies-image",
      intro: "ImagesText",
      show: false,
      alreadySeen: false,
      hideOn: [],
      showOn: []
    },
    {
      id: "link-page-button",
      element: "#link-page-button",
      intro: "Link page",
      show: false,
      alreadySeen: true,
      hideOn: [],
      showOn: []
    }
  ],
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
      pageNumbering: true,
      pageBreakOriginal: true,
      pageBreakEdition: true
    },
    introToggles: {
      personInfo: true,
      placeInfo: false,
      workInfo: true,
      pageNumbering: true,
      pageBreakEdition: true
    },
    displayTypesToggles: {
      showAll: true,
      established: true,
      comments: true,
      manuscripts: true,
      variations: true,
      facsimiles: true,
      introduction: false,
      illustrations: true,
      legend: true
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
    showReadTextIllustrations: ["20212", "20213", "206"],
    sortableLetters: ["220", "219", "215", "211"]
  },
  i18n: {
    languages: ["sv", "fi"],
    locale: "sv",
    enableLanguageChanges: true
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
      SongTypes: false,
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
  AccordionMusic: false,
  SearchTocItemInAccordionByTitle: false,
  AccordionsExpandedDefault: {
    SongTypes: false,
    Music: false
  },
  MusicAccordion: {
    PersonSearchTypes: false,
    TagSearch: false,
    PlaceSearch: false,
    Music: false
  },
  AboutMenuAccordion: true,
  HasCover: true,
  HasTitle: true,
  HasForeword: true,
  HasIntro: true,
  OpenOccurrencesAndInfoOnNewPage: false,
  SingleOccurrenceType: null,
  MusicPage: {
    collectionsToShow: []
  },
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
    name: {
      sv: "Kerstin Söderholm",
      fi: "Kerstin Söderholm",
      en: "Kerstin Söderholm"
    },
    siteLogoURL: "https://www.sls.fi/",
    CollectionSortOrder: {
      378:1, 379:2, 380:3, 381:4, 382:5, 383:6, 384:7, 385:8, 386:9, 387:10,
      388:11, 389:12, 390:13, 391:14, 392:15, 393:16, 394:17, 395:18, 396:19,
      397:20, 398:21, 399:22, 400:23, 401:24, 402:25, 403:26, 404:27, 405:28, 
      406:29, 407:30, 408:31, 409:32, 410:33, 411:34, 412:35, 413:36, 414:37, 
      415:38, 416:39, 417:40, 418:41, 419:42, 420:43, 421:44, 422:45, 423:46,
      424:47, 425:48, 426:49, 427:50, 428:51, 429:52, 430:53, 431:54, 432:55,
      433:56, 434:57, 435:58, 436:59, 437:60, 438:61, 439:62, 440:63, 441:64,
      442:65, 443:66, 444:67, 445:68, 446:69, 447:70, 448:71, 449:72, 450:73, 
      451:74, 452:75, 453:76, 454:77, 455:78, 456:79, 540:80, 457:81, 458:82,
      459:83, 460:84, 461:85, 462:86, 463:87, 464:88, 465:89, 466:90, 467:91, 
      468:92, 469:93, 470:94, 471:95, 472:96, 473:97, 474:98, 475:99, 476:100, 
      477:101, 478:102, 479:103, 480:104, 481:105, 482:106, 483:107, 484:108,
      485:109, 486:110, 487:111, 488:112, 489:113, 490:114, 491:115, 492:116, 
      493:117, 494:118, 495:119, 496:120, 497:121, 498:122, 499:123, 500:124,
      501:125, 502:126, 503:127, 504:128, 505:129, 506:130, 507:131, 508:132, 
      509:133, 510:136.1, 511:135, 512:136, 513:137, 514:138, 515:139, 516:140,
      517:141, 518:142, 519:143, 520:144, 521:145, 522:146, 523:147, 524:148,
      525:149, 526:150, 527:151,528:152, 529:153, 530:154, 531:155, 532:156, 
      533:157, 534:158, 535:159, 536:160, 1084: 161, 2559: 198, 1646: 199,
      1699:200,1701:201,1747:202,1702:203,1703:204,1704:205,
      1726:206,1705:207,1714:208,1706:209,1707:210,1715:211,
      1721:212,1716:213,1717:214,1718:215,1708:216,1722:217,
      1749:218,1742:219,1719:220,1748:221,1731:222,1746:223,
      1745:224,1720:225,1743:226,1752:227,1711:228,1710:229,
      1712:230,1727:231,1713:232,1709:233,1700:234,1751:235,
      1739:236,1738:237,1741:238,1723:239,1724:240,1725:241,
      1737:242,1740:243,1750:244,1729:245,1732:246,1733:247,
      1734:248,1735:249,1736:250
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
      showSimpleSearch: false,
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
    music: {
      collectionsToShow: []
    },
    read: {
      showURNButton: true,
      showViewOptionsButton: true
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
      showSimpleSearchButton: false,
      showURNButton: false,
      showLanguageButton: false,
      showMusicButton: false,
      showHelpButton: false
    }
  },
  urnResolverUrl: "https://urn.fi/",
  useSimpleWorkMetadata: false,
  showOpenLegendButton: {
    manuscripts: false,
    variations: false
  },
  showTutorial: false,
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
      pageNumbering: false,
      pageBreakOriginal: false,
      pageBreakEdition: false
    },
    introToggles: {
      personInfo: false,
      placeInfo: false,
      workInfo: false,
      pageNumbering: false,
      pageBreakEdition: false
    },
    displayTypesToggles: {
      showAll: false,
      established: false,
      comments: false,
      manuscripts: true,
      variations: false,
      facsimiles: true,
      introduction: false,
      illustrations: false,
      legend: false
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
    showReadTextIllustrations: [],
    sortableLetters: []
  },
  i18n: {
    languages: ["sv"],
    locale: "sv",
    enableLanguageChanges: false
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
      SongTypes: false,
      Books: false,
      EPUB: true,
      splitReadCollections: [
        [378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,
        393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,
        408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,
        423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,
        438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,
        453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,
        468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,
        483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,
        498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,
        513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,
        528,529,530,531,532,533,534,535,536,540,1084], 
        [2559],
        [1646,1699,1700,1701,1702,1703,1704,1705,1706,1707,1708,1709,1710,1711,1712,
        1713,1714,1715,1716,1717,1718,1719,1720,1721,1722,1723,1724,1725,1726,1727,
        1729,1731,1732,1733,1734,1735,1736,1737,1738,1739,1740,1741,1742,1743,1745,
        1746,1747,1748,1749,1750,1751,1752]
      ]
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
  AccordionMusic: false,
  SearchTocItemInAccordionByTitle: false,
  AccordionsExpandedDefault: {
    SongTypes: false,
    Music: false
  },
  MusicAccordion: {
    PersonSearchTypes: false,
    TagSearch: false,
    PlaceSearch: false,
    Music: false
  },
  AboutMenuAccordion: true,
  HasCover: false,
  HasTitle: false,
  HasForeword: false,
  HasIntro: false,
  OpenOccurrencesAndInfoOnNewPage: false,
  SingleOccurrenceType: null,
  MusicPage: {
    collectionsToShow: []
  },
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
