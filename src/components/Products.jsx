import {
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Pagination,
  Page,
  Layout,
  Banner,
  Thumbnail, Filters, TextField, ChoiceList
} from "@shopify/polaris";
import {gql, useLazyQuery} from "@apollo/client";
import {Loading, useClientRouting, useRoutePropagation} from "@shopify/app-bridge-react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useSearchParams, useNavigate} from "react-router-dom";
import { debounce } from "lodash";

const GET_PRODUCTS = gql`
  query getProducts($first:Int, $last:Int, $after:String, $before:String, 
                    $sortKey:ProductSortKeys, $reverse:Boolean, $query:String) {
    products(first:$first, last:$last, after:$after, before:$before, sortKey:$sortKey, reverse:$reverse, query:$query) {
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


export function ProductsList() {
  const PRODUCT_PER_PAGE = 2;
  const [isFetched, setIsFetched] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') ? searchParams.get('query') : '');
  const [getProducts, {loading, error, data, previousData}] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'no-cache',
    variables: {
      first: searchParams.get('before') ? null : PRODUCT_PER_PAGE,
      last: searchParams.get('after') ? null : searchParams.get('before') ? PRODUCT_PER_PAGE : null,
      after: searchParams.get('after'),
      before: searchParams.get('before'),
      sortKey: searchParams.get('sortKey') ? searchParams.get('sortKey') : 'TITLE',
      reverse: searchParams.get('reverse') === 'true',
      query: searchParams.get('query')
    }
  });
  const customData = useMemo(() => loading ? previousData : data, [loading, data]);
  let navigate = useNavigate();
  let location = useLocation();
  useRoutePropagation(location);
  useClientRouting({replace: navigate});


  useEffect(async () => {
    await getProducts();
    setIsFetched(true)
  }, [])


  const onNext = useCallback(async () => {
    await getProducts({variables:{
      first: PRODUCT_PER_PAGE,
      last: null,
      after: data.products.pageInfo.endCursor,
      before: null,
      sortKey: searchParams.get('sortKey'),
      reverse: searchParams.get('reverse') === 'true',
      query: searchParams.get('query')
    }})
    setSearchParams({
      after: data.products.pageInfo.endCursor,
      sortKey: searchParams.get('sortKey'),
      reverse: searchParams.get('reverse'),
      query: searchParams.get('query')
    })
  }, [customData])

  const onPrevious = useCallback(async () => {
    await getProducts({variables:{
      first: null,
      last: PRODUCT_PER_PAGE,
      after: null,
      before: data.products.pageInfo.startCursor,
      sortKey: searchParams.get('sortKey'),
      reverse: searchParams.get('reverse') === 'true',
      query: searchParams.get('query')
    }})
    setSearchParams({
      before: data.products.pageInfo.startCursor,
      sortKey: searchParams.get('sortKey'),
      reverse: searchParams.get('reverse'),
      query: searchParams.get('query')
    })
  }, [customData])

  const changeSort = async (selected) => {
    let params = {}
    switch (selected) {
      case 'TITLE_ASC':
        params = { sortKey: 'TITLE', reverse: false }
        break
      case 'TITLE_DESC':
        params = { sortKey: 'TITLE', reverse: true }
        break
      case 'CREATED_AT_ASC':
        params = { sortKey: 'CREATED_AT', reverse: false }
        break
      case 'CREATED_AT_DESC':
        params = { sortKey: 'CREATED_AT', reverse: true }
        break
    }
    setSearchParams({...params, query:searchParams.get('query')})
    await getProducts({variables:{
        first: PRODUCT_PER_PAGE,
        sortKey: params.sortKey,
        reverse: params.reverse,
        query: searchParams.get('query')
      }})
  }

  const handleFiltersQueryChange = async (value) => {
    setQueryValue(value);
    setSearchParams({query: value});
    // debounce(() => {
    //   console.log('sdff')
    //   getProducts({variables:{
    //       first: PRODUCT_PER_PAGE,
    //       query: `title:${value}*`
    //     }})
    // }, 300)
  }


  const handleQueryValueRemove = async () => {
    setQueryValue('');
    setSearchParams({});
    await getProducts();
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
    );
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
                resourceName={{singular: 'Product', plural: 'Products'}}
                items={customData.products.edges}
                sortValue={searchParams.get('reverse') === 'true'
                  ? `${searchParams.get('sortKey')}_DESC`
                  : `${searchParams.get('sortKey')}_ASC`}
                sortOptions={[
                  {label: 'Product title A-Z', value: 'TITLE_ASC'},
                  {label: 'Product title Z-A', value: 'TITLE_DESC'},
                  {label: 'Created (oldest first)', value: 'CREATED_AT_ASC'},
                  {label: 'Created (newest first)', value: 'CREATED_AT_DESC'},
                ]}
                onSortChange={(selected) => changeSort(selected)}
                renderItem={(item) => {
                  const id = item.node.id
                  const media = (
                    <Thumbnail
                      source={item.node.images.edges[0] ? item.node.images.edges[0].node.url : ""}
                      alt={item.node.images.edges[0] ? item.node.images.edges[0].node.altText : ""}
                  />)
                  const title = item.node.title;
                  const productType = item.node.productType;

                  return (
                    <ResourceItem
                      id = {id}
                      media = {media}
                      name = {title}
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <h3>
                        <TextStyle variation="strong">{title}</TextStyle>
                      </h3>
                      <p>{productType}</p>
                    </ResourceItem>
                  );
                }}
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
  );
}