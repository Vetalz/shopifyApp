import {
  Page,
  Layout,
  Card,
  ResourceList,
  Pagination,
  Thumbnail,
  ResourceItem,
  TextStyle,
  Banner, Filters, ChoiceList
} from "@shopify/polaris";
import {gql, useLazyQuery} from "@apollo/client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Loading, useClientRouting, useRoutePropagation} from "@shopify/app-bridge-react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {debounce} from "lodash";


const GET_PRODUCTS = gql`
  query getProducts($first:Int, $last:Int, $after:String, $before:String, 
                    $query:String, $sortKey:ProductSortKeys, $reverse:Boolean) {
    products(first:$first, last:$last, after:$after, before:$before, query:$query, sortKey:$sortKey, reverse:$reverse) {
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
const debouncedFetchData = debounce((callback, value, statusValue, sortValue) => {
  callback({
    query: value,
    status: statusValue,
    sortKey: sortValue.sortKey,
    reverse: sortValue.reverse
  })
}, 500);

export function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') !== 'null' ? searchParams.get('query') : '');
  const [statusValue, setStatusValue] = useState(searchParams.get('status') !== 'null' ? searchParams.get('status') : null);
  const [sortValue, setSortValue] = useState({
    sortKey: 'TITLE',
    reverse: searchParams.get('reverse') === 'true'});
  const [getProducts, {loading, error, data, previousData}] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'no-cache'});
  const customData = useMemo(() => loading ? previousData : data, [loading]);
  let navigate = useNavigate();
  let location = useLocation();
  useRoutePropagation(location);
  useClientRouting({replace: navigate});

  useEffect(async() => {
    const query = queryValue && statusValue
      ? `${queryValue} AND status:${statusValue}`
      : queryValue
        ? queryValue
        : statusValue
          ? `status:${statusValue}`
          : null
    const variables = {
      first: searchParams.get('before') ? null : PRODUCT_PER_PAGE,
      last: searchParams.get('after') ? null : searchParams.get('before') ? PRODUCT_PER_PAGE : null,
      after: searchParams.get('after'),
      before: searchParams.get('before'),
      query: query,
      sortKey: sortValue.sortKey,
      reverse: sortValue.reverse,
    }

    await getProducts({
      variables: variables
    });

  }, [searchParams]);

  const onPrevious = useCallback(() => {
    setSearchParams({
      before: customData.products.pageInfo.startCursor,
      query: searchParams.get('query') !== 'null' ? searchParams.get('query') : null,
      status: searchParams.get('status') !== 'null' ? searchParams.get('status') : null,
      sortKey: searchParams.get('sortKey') !== 'null' ? searchParams.get('sortKey') : null,
      reverse: searchParams.get('reverse') !== 'null' ? searchParams.get('reverse') : null
    })
  }, [customData]);

  const onNext = useCallback(() => {
    setSearchParams({
      after: customData.products.pageInfo.endCursor,
      query: searchParams.get('query') !== 'null' ? searchParams.get('query') : null,
      status: searchParams.get('status') !== 'null' ? searchParams.get('status') : null,
      sortKey: searchParams.get('sortKey') !== 'null' ? searchParams.get('sortKey') : null,
      reverse: searchParams.get('reverse') !== 'null' ? searchParams.get('reverse') : null
    })
  }, [customData]);

  const handleSort = useCallback((selected) => {
    let params = {};
    switch (selected) {
      case 'TITLE_ASC':
        params = {sortKey: 'TITLE', reverse: false}
        break
      case 'TITLE_DESC':
        params = {sortKey: 'TITLE', reverse: true}
        break
    }
    setSortValue(params);
    setSearchParams({query: queryValue, status: statusValue, sortKey: params.sortKey, reverse: params.reverse});
  }, [sortValue, queryValue, statusValue]);

  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value);
    debouncedFetchData(setSearchParams, value, statusValue, sortValue);
  }, [queryValue, statusValue, sortValue]);

  const handleProductStatus = useCallback((value) => {
    setStatusValue(value[0]);
    setSearchParams({query: queryValue, status: value, sortKey: sortValue.sortKey, reverse: sortValue.reverse});
  },[statusValue, queryValue, sortValue]);

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue('');
    setSearchParams({status: statusValue, sortKey: sortValue.sortKey, reverse: sortValue.reverse});
  }, [queryValue, statusValue, sortValue]);

  const handleStatusValueRemove = useCallback(() => {
    setStatusValue(null);
    setSearchParams({query: queryValue, sortKey: sortValue.sortKey, reverse: sortValue.reverse});
  }, [statusValue, queryValue, sortValue]);

  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
    handleStatusValueRemove();
  },[queryValue, statusValue]);

  const appliedFilters = [];
  if (statusValue) {
    const key = 'productStatus';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, statusValue),
      onRemove: handleStatusValueRemove,
    });
  }

  function disambiguateLabel(key, value) {
    switch (key) {
      case 'productStatus':
        return `Product status ${value}`;
      default:
        return value;
    }
  }

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
      filters={[
        {
          key: 'productStatus',
          label: 'Product status',
          filter: (
            <ChoiceList
              title="Product status"
              titleHidden
              choices={[
                {label: 'active', value: 'active'},
                {label: 'draft', value: 'draft'}
              ]}
              selected={[statusValue]}
              onChange={handleProductStatus}
            />
          ),
          shortcut: true,
        },
      ]}
      appliedFilters={appliedFilters}
      onQueryChange={handleFiltersQueryChange}
      onClearAll={handleFiltersClearAll}
      onQueryClear={handleQueryValueRemove}
    >
    </Filters>
  )

  if (!customData) {
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
          <Card>
            <div style={{padding: '20px'}}>
              <ResourceList
                loading={loading}
                filterControl={filterControl}
                items={customData.products.edges}
                renderItem={templateItem}
                sortValue={sortValue.reverse
                  ? `${sortValue.sortKey}_DESC`
                  : `${sortValue.sortKey}_ASC` }
                sortOptions={[
                  {label: 'Product title A-Z', value: 'TITLE_ASC'},
                  {label: 'Product title Z-A', value: 'TITLE_DESC'},
                ]}
                onSortChange={handleSort}
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