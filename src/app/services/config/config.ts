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
