import {
  Page,
  Layout,
  Card,
  ResourceList,
  Pagination,
  Thumbnail,
  ResourceItem,
  TextStyle,
  Banner, Filters
} from "@shopify/polaris";
import {gql, useLazyQuery} from "@apollo/client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Loading, useClientRouting, useRoutePropagation} from "@shopify/app-bridge-react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {debounce} from "lodash";


const GET_PRODUCTS = gql`
  query getProducts($first:Int, $last:Int, $after:String, $before:String, $query:String) {
    products(first:$first, last:$last, after:$after, before:$before, query:$query) {
      edges {
        node {
          id
          images(first:1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          title
          productType
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }`
const PRODUCT_PER_PAGE = 2;
const debouncedFetchData = debounce((callback, value) => {
  callback({query: value})
}, 500);

export function ProductsList() {
  const [isFetched, setIsFetched] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') !== 'null' ? searchParams.get('query') : '')
  const [getProducts, {loading, error, data, previousData}] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'no-cache'});
  const customData = useMemo(() => loading ? previousData : data, [loading])
  let navigate = useNavigate();
  let location = useLocation();
  useRoutePropagation(location);
  useClientRouting({replace: navigate});

  useEffect(async() => {
    await getProducts({
      variables: {
        first: searchParams.get('before') ? null : PRODUCT_PER_PAGE,
        last: searchParams.get('after') ? null : searchParams.get('before') ? PRODUCT_PER_PAGE : null,
        after: searchParams.get('after'),
        before: searchParams.get('before'),
        query: searchParams.get('query') !== 'null' ? searchParams.get('query') : null
      }
    });

    setIsFetched(true);
  },  [searchParams])

  useEffect(() => {
    if (queryValue !== '') {
      debouncedFetchData(setSearchParams, queryValue);
    } else {
      setSearchParams({})
    }
  }, [queryValue])

  const onPrevious = useCallback(() => {
    setSearchParams({
      before: customData.products.pageInfo.startCursor,
      query: searchParams.get('query') !== 'null' ? searchParams.get('query') : null
    })
  }, [customData])

  const onNext = useCallback(() => {
    setSearchParams({
      after: customData.products.pageInfo.endCursor,
      query: searchParams.get('query') !== 'null' ? searchParams.get('query') : null
    })
  }, [customData])

  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, [queryValue])

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue('');
    setSearchParams({});
  }, [queryValue])

  const templateItem = (item) => {
    const id = item.node.id
    const media = (
      <Thumbnail
        source = {item.node.images.edges[0] ? item.node.images.edges[0].node.url : ""}
        alt = {item.node.images.edges[0] ? item.node.images.edges[0].node.altText : ""}
      />)
    const title = item.node.title
    const productType = item.node.productType

    return (
      <ResourceItem
        id= {id}
        media = {media}
        name = {title}
        accessibilityLabel={`View details for ${title}`}
      >
        <h3>
          <TextStyle variation="strong">{title}</TextStyle>
        </h3>
        <p>{productType}</p>
      </ResourceItem>
    )
  }

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={[]}
      onQueryChange={handleFiltersQueryChange}
      onClearAll={handleQueryValueRemove}
      onQueryClear={handleQueryValueRemove}
    >
    </Filters>
  )

  if (!isFetched) {
    return <Loading />;
  }

  if (error) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue loading products.</Banner>
    )
  }


  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card title="Products list">
            <div style={{padding: '20px'}}>
              <ResourceList
                loading={loading}
                filterControl={filterControl}
                items={customData.products.edges}
                renderItem={templateItem}
              />
              <Pagination
                hasPrevious={customData.products.pageInfo.hasPreviousPage}
                onPrevious={onPrevious}
                hasNext={customData.products.pageInfo.hasNextPage}
                onNext={onNext}
              />
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}