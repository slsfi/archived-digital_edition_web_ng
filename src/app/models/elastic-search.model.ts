export interface Aggregation {
    terms?: Terms
    date_histogram?: DateHistogram
}

export interface AggregationData {
    buckets?: Facet[]
    filtered?: {
        buckets: Facet[]
    }
}

export interface AggregationQuery {
    queries: string[]
    facetGroups?: FacetGroups
    range?: TimeRange
}

export interface Aggregations {
    [key: string]: Aggregation
}

export interface AggregationsData {
    [aggregationKey: string]: AggregationData
}

export interface DateHistogram {
    field: string
    calendar_interval: string,
    format: string
}

export interface Facet {
    doc_count: number
    key: string | number
    key_as_string?: string
    selected?: boolean
}

export interface FacetGroups {
    [facetGroupKey: string]: Facets
}

export interface Facets {
    [facetKey: string]: Facet
}

export interface SearchQuery {
    queries: string[]
    highlight: object
    from: number
    size: number
    facetGroups?: FacetGroups
    range?: TimeRange
    sort?: object[]
}

export interface SuggestionsConfig {
    [aggregationKey: string]: {
        field: string
        size: number
    }
}

export interface SuggestionsQuery {
    query: string
}

export interface Terms {
    size: number
    field: string
}

export interface TimeRange {
    from?: string | number
    to?: string | number
}
