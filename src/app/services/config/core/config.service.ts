import { Injectable } from '@angular/core';
import { get } from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config = {
    "app": {
        "readContent": "...",
        "machineName": "topelius",
        "projectId": 10,
        "useLegacyIdsForSemanticData": false,
        "legacyIdPrefix": "",
        "apiEndpoint": "https://api.sls.fi/digitaledition",
        "showViewToggle": false,
        "showTopURNButton": false,
        "showTopElasticButton": false,
        "showTopMusicButton": false,
        "siteLogoURL": "https://www.sls.fi",
        "page-title": {
            "sv": "",
            "fi": "",
            "en": ""
        },
        "name": {
            "sv": "Zacharias Topelius Skrifter",
            "fi": "Zacharias Topeliuksen Kirjoitukset",
            "en": "Zacharias Topeliuksen Kirjoitukset"
        },
        "subTitle1": {
            "sv": "Inte en dag utan en rad",
            "fi": "Fi: Författaren, redaktören, professorn och privatpersonen Zacharias Topelius verk i en textkritisk och kommenterad digital utgåva.",
            "en": "Zacharias Topeliuksen Kirjoitukset"
        },
        "subTitle2": {
            "sv": "Författaren, redaktören, professorn och privatpersonen Zacharias Topelius verk i en textkritisk och kommenterad digital utgåva.",
            "fi": "Fi: Författaren, redaktören, professorn och privatpersonen Zacharias Topelius verk i en textkritisk och kommenterad digital utgåva.",
            "en": "Zacharias Topeliuksen Kirjoitukset"
        },
        "CollectionSortOrder": {}
    },
    "frontpageConfig": {
        "imageOrientationIsPortrait": false,
        "imageOnRightIfPortrait": false,
        "siteTitleOnTopOfImageInMobileModeIfPortrait": false,
        "imageUrl": "assets/images/frontpage-image-landscape.jpg",
        "portraitImageUrlInMobileMode": "assets/images/frontpage-image-square.jpg",
        "portraitImageAltText": "",
        "showSimpleSearch": false,
        "showEditionList": false,
        "showFooter": false
    },
    "showURNButton": {
        "topMenu": false,
        "pageTitle": true,
        "pageForeword": true,
        "pageIntroduction": true,
        "pageRead": true,
        "pageEpub": false,
        "mediaCollection": true
    },
    "urnResolverUrl": "https://urn.fi/",
    "useSimpleWorkMetadata": false,
    "showOpenLegendButton": {
        "manuscripts": true,
        "variations": true
    },
    "showTutorial": false,
    "TutorialSteps": [{
            "id": "welcome",
            "intro": "WelcomeText",
            "show": true,
            "alreadySeen": false,
            "hideOn": [],
            "showOn": []
        },
        {
            "id": "menu",
            "element": "#menuToggle",
            "intro": "MenuToggleText",
            "show": true,
            "alreadySeen": false,
            "hideOn": [],
            "showOn": []
        },
        {
            "id": "readtoc",
            "element": "#readTocItem",
            "intro": "ReadTocItemText",
            "show": true,
            "alreadySeen": false,
            "hideOn": [
                "HomePage"
            ],
            "showOn": []
        },
        {
            "id": "downloadCache",
            "element": "#downloadPerson",
            "intro": "DownloadCacheText",
            "show": false,
            "alreadySeen": false,
            "hideOn": [],
            "showOn": [
                "PersonSearchPage"
            ]
        }
    ],
    "settings": {
        "readToggles": {
            "comments": true,
            "personInfo": true,
            "placeInfo": true,
            "workInfo": true,
            "changes": true,
            "normalisations": true,
            "abbreviations": true,
            "pageNumbering": true,
            "pageBreakOriginal": true,
            "pageBreakEdition": true
        },
        "introToggles": {
            "personInfo": false,
            "placeInfo": false,
            "workInfo": false,
            "pageNumbering": true,
            "pageBreakEdition": false
        },
        "displayTypesToggles": {
            "showAll": true,
            "established": true,
            "comments": true,
            "manuscripts": true,
            "variations": true,
            "facsimiles": true,
            "introduction": true,
            "songexample": false
        },
        "toolTips": {
            "comments": true,
            "personInfo": true,
            "placeInfo": true,
            "changes": true,
            "normalisations": true,
            "variations": true,
            "abbreviations": true,
            "workInfo": true,
            "footNotes": true
        },
        "enableModeToggle": true,
        "getFacsimilePagesInfinite": false,
        "showReadTextIllustrations": [],
        "galleryCollectionMapping": {"214": 44},
        "facsimileDefaultZoomLevel": 3,
        "facsimileZoomPageLevel": 1
    },
    "i18n": {
        "languages": [
			"sv", "fi"
        ],
        "locale": "sv",
        "enableLanguageChanges": false,
        "multilingualTOC": false,
        "multilingualEST": false,
        "estLanguages": []
    },
    "collectionDownloads": {
        "isDownloadOnly": false,
        "pdf": [{
            "pdfFile": "12_3456_sample.pdf",
            "thumbnail": "12_3456.png",
            "title": "Sample PDF title",
            "collectionId": "12",
            "facsimileId": "789",
            "publicationId": "3456",
            "child": false
        }],
        "epub": {}
    },
    "simpleSearch": {
        "showPageNumbers": false,
        "user_defined_search_fields": [
            "textData"
        ]
    },
    "editionImages": {
        "default": "assets/images/edition-default-cover.jpg",
        "1": "assets/images/omslag_1.jpg",
        "4": "assets/images/omslag_4.jpg",
        "5": "assets/images/omslag_4.jpg",
        "10": "assets/images/omslag_10.jpg",
        "12": "assets/images/omslag_12.jpg",
        "13": "assets/images/omslag_13.jpg",
        "15": "assets/images/omslag_15.jpg",
        "20": "assets/images/omslag_20.jpg"
    },
    "editionShortTexts": {
        "sv": {
            "default": "En undertitel med lite data...",
            "1": "Tidiga dikter",
            "15": "Korrespondens med förlag och förläggare",
            "4": "Tolv noveller, ursprungligen publicerade som följetonger",
            "5": "Fyra historiska noveller",
            "12": "Historiskt-geografiskt bildverk",
            "13": "Historiskt-geografiskt bildverk",
            "10": "Läseböcker för folkskolan",
            "20": "   "
        },
        "fi": {
            "default": "FI - En undertitel med lite data...",
            "1": "FI - Tidiga dikter",
            "15": "FI - Korrespondens med förlag och förläggare",
            "4": "FI - Tolv noveller, ursprungligen publicerade som följetonger",
            "5": "FI - Fyra historiska noveller"
        },
        "en": {
            "default": "a Subtitle...",
            "29": "Hilma Granqvists Diaries",
            "30": "Download PDF",
            "31": "Download PDF2"
        }
    },
    "single-editions": {
        "sv": {
            "toc": "Innehåll"
        },
        "fi": {
            "toc": "Lue digitaalisesti"
        }
    },
    "staticPages": {
        "about_index": 0,
        "frontpage": {
            "sv": {
                "name": "Hem",
                "file": "frontpage-sv"
            },
            "fi": {
                "name": "Koti",
                "file": "frontpage-fi"
            }
        },
        "editions": {
            "sv": {
                "name": "Läs digitalt",
                "file": "editions-sv"
            },
            "fi": {
                "name": "Lue digitaalisesti",
                "file": "editions-fi"
            }
        },
        "about": [{
                "sv": {
                    "name": "Om utgåvan",
                    "file": "about--about-edition-sv"
                },
                "fi": {
                    "name": "Testi",
                    "file": "about--about-edition-fi"
                }
            },
            {
                "sv": {
                    "name": "Rättelser och tillägg",
                    "file": "about--corrections-and-additions-sv"
                },
                "fi": {
                    "name": "Testi",
                    "file": "about--corrections-and-additions-fi"
                }
            },
            {
                "sv": {
                    "name": "Om mobilversionen",
                    "file": "about--mobile-limitations-sv"
                },
                "fi": {
                    "name": "Testi",
                    "file": "about--mobile-limitations-fi"
                }
            },
            {
                "sv": {
                    "name": "Organisation och kontakt",
                    "file": "about--organisation-and-contact-sv"
                },
                "fi": {
                    "name": "Testi",
                    "file": "about--organisation-and-contact-fi"
                }
            },
            {
                "sv": {
                    "name": "Om Topelius",
                    "file": "about--about-author-sv"
                },
                "fi": {
                    "name": "Testi",
                    "file": "about--organisation-and-contact-fi"
                }
            }
        ]
    },
    "galleryImages": {
        "0": {
            "prefix": "FFiT_",
            "numberOfImages": 120
        },
        "1": {
            "prefix": "ERiF_",
            "numberOfImages": 39
        },
        "2": {
            "prefix": "foo_",
            "numberOfImages": 0
        }
    },
    "show": {
        "TOC": {
            "Home": true,
            "About": true,
            "Read": true,
            "Facsimiles": true,
            "ImageGallery": true,
            "MediaCollections": true,
            "PersonSearch": true,
            "PlaceSearch": true,
            "TagSearch": true,
            "WorkSearch": true,
            "SongTypes": false,
            "Books": false,
            "splitReadCollections":[],
            "EPUB": false
        }
    },
    "defaults": {
        "ReadModeView": "established"
    },
    "cache": {
        "viewmodes": {
            "daysUntilExpires": 2
        }
    },
    "PersonSearchTypes": [{
        "object_type": "subject",
        "object_subtype": "",
        "translation": "TOC.PersonSearch"
    }],
    "ImageGallery": {
      "ShowInReadMenu": true
    },
    "PersonSearch": {
        "ShowFilter": true,
        "ShowPublishedStatus": 2,
        "InitialLoadNumber": 800
    },
    "LocationSearch": {
        "ShowFilter": true,
        "ShowPublishedStatus": 2
    },
    "TagSearch": {
        "ShowFilter": true,
        "ShowPublishedStatus": 2
    },
    "StaticPagesMenus": [{
        "menuID": "aboutMenu",
        "idNumber": "03",
        "hasMenuConditional": false,
        "initialAboutPage": "03-01-01"
    }],
    "Occurrences": {
      "HideTypeAndDescription": false,
      "ShowPublishedStatus": 2
    },
    "StaticPagesMenusInTOC": [],
    "LoadCollectionsFromAssets": false,
    "LoadTitleFromDB": true,
    "StaticMarkdownCovers": false,
    "ProjectStaticMarkdownCoversFolder": "08",
    "ProjectStaticMarkdownTitleFolder": "05",
    "showOccurencesModalOnReadPageAfterSearch": {
        "tagSearch": true,
        "personSearch": false,
        "placeSearch": false
    },
    "SortCollectionsByRomanNumerals": false,
    "AccordionTOC": false,
    "AccordionMusic": false,
    "SearchTocItemInAccordionByTitle": false,
    "AccordionsExpandedDefault": {
        "SongTypes": false,
        "Music": false
    },
    "MusicAccordion": {
        "PersonSearchTypes": false,
        "TagSearch": false,
        "PlaceSearch": false,
        "Music": false
    },
    "HasCover": true,
    "HasTitle": true,
    "HasForeword": true,
    "HasIntro": true,
    "defaultSelectedItem": "cover",
    "SidemenuMobile": true,
    "OpenOccurrencesAndInfoOnNewPage": false,
    "SingleOccurrenceType": null,
    "HideBackButton": {
        "TopMenu": true
    },
    "MusicPage": {
        "collectionsToShow": []
    },
    "separeateIntroductionToc": false,
    "ElasticSearch": {
        "indices": [
            "topelius"
        ],
        "fixedFilters": [{
            "terms": {
                "publication_data.published": [
                    2
                ]
            }
        }],
        "types": [
            "est",
            "com",
            "var",
            "inl",
            "tit",
            "ms"
        ],
        "hitsPerPage": 20,
        "source": [
            "xml_type",
            "TitleIndexed",
            "publication_data",
            "publication_locations",
            "publication_subjects",
            "publication_tags",
            "name",
            "collection_name",
            "orig_date_year_uncertain",
            "orig_date_certain",
            "receiver_subject_name",
            "sender_subject_name",
            "receiver_location_name",
            "sender_location_name"
        ],
        "aggregations": {
            "Years": {
                "date_histogram": {
                    "field": "orig_date_certain",
                    "calendar_interval": "year",
                    "format": "yyyy"
                }
            },
            "Type": {
                "terms": {
                    "field": "xml_type.keyword",
                    "size": 40
                }
            },
            "Genre": {
                "terms": {
                    "field": "publication_data.genre.keyword",
                    "size": 40
                }
            },
            "Collection": {
                "terms": {
                    "field": "publication_data.colname.keyword",
                    "size": 40
                }
            },
            "Location": {
                "terms": {
                    "field": "publication_locations.keyword",
                    "size": 40
                }
            },
            "Subjects": {
                "terms": {
                    "field": "publication_subjects.keyword",
                    "size": 40
                }
            },
            "Tags": {
                "terms": {
                    "field": "publication_tags.keyword",
                    "size": 40
                }
            },
            "Person": {
                "terms": {
                    "field": "persName.keyword",
                    "size": 40
                }
            },
            "LetterSenderName": {
                "terms": {
                    "field": "sender_subject_name.keyword",
                    "size": 40
                }
            },
            "LetterReceiverName": {
                "terms": {
                    "field": "receiver_subject_name.keyword",
                    "size": 40
                }
            },
            "LetterSenderLocation": {
                "terms": {
                    "field": "sender_location_name.keyword",
                    "size": 40
                }
            },
            "LetterReceiverLocation": {
                "terms": {
                    "field": "receiver_location_name.keyword",
                    "size": 40
                }
            }
        },
        "suggestions": {
            "LetterSenderName": {
                "field": "sender_subject_name",
                "size": 3
            },
            "LetterSenderLocation": {
                "field": "sender_location_name",
                "size": 3
            }
        }
    },
    "OpenCollectionFromToc": true,
    "siteMetaData": {
      "keywords": "Digital Edition",
      "description": "A Platform for Digital Editions",
      "website": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "sls.fi",
        "alternateName": "Svenska litteratursällskapet i Finland",
        "url": "https://www.sls.fi",
        "sameAs": ["", ""]
      },
      "organization": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url":"https://www.sls.fi",
        "logo":"https://granska-topelius.sls.fi/assets/images/logo.svg"
      }
    },
    "AvailableEpubs": {
      "Dagböcker": {
        "filename": "NY_soderholm_dagbocker.epub",
        "download": "https://www.sls.fi/sv/utgivning/kerstin-soderholms-dagbocker"
      }
    },
    "textDownloadOptions": {
        "enabledIntroductionFormats": {
            "xml": true,
            "print": true
        },
        "enabledEstablishedFormats": {
            "xml": true,
            "txt": true,
            "print": true
        },
        "enabledCommentsFormats": {
            "xml": true,
            "txt": true,
            "print": true
        },
        "usePrintNotDownloadIcon": false
    },
    "showDisplayOptionsButton": {
        "pageTitle": true,
        "pageForeword": true,
        "pageIntroduction": true,
        "pageRead": true,
        "pageEpub": true
    }
}

  constructor() {}


  getSettings(key: string) {
    const result = get(this.config, key);

    if (result === undefined) {
      throw new Error(
        `No setting found with the specified key ${key}!`
      );
    }

    return result;
  }
}
