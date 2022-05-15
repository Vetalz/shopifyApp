import {
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Pagination,
  Page,
  Layout,
  Banner,
  Thumbnail
} from "@shopify/polaris";
import {gql, useLazyQuery} from "@apollo/client";
import {Loading, useClientRouting, useRoutePropagation} from "@shopify/app-bridge-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocation, useSearchParams, useNavigate} from "react-router-dom";

const GET_PRODUCTS = gql`
  query getProducts($first:Int, $last:Int, $after:String, $before:String) {
    products(first:$first, last:$last, after:$after, before:$before) {
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
  const [getProducts, {loading, error, data, previousData}] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'no-cache',
    variables: {
      first: searchParams.get('before') ? null : PRODUCT_PER_PAGE,
      last: searchParams.get('after') ? null : searchParams.get('before') ? PRODUCT_PER_PAGE : null,
      after: searchParams.get('after'),
      before: searchParams.get('before')
    }
  });
  const customData = useMemo(() => loading ? previousData : data, [loading, data]);
  let navigate = useNavigate();
  let location = useLocation();
  useRoutePropagation(location);
  useClientRouting({replace: navigate})

  useEffect(async () => {
    await getProducts();
    setIsFetched(true)
  }, [])


  const onNext = useCallback(async () => {
    await getProducts({variables:{
      first: PRODUCT_PER_PAGE,
      last: null,
      after: data.products.pageInfo.endCursor,
      before: null
    }})
    setSearchParams({ after: data.products.pageInfo.endCursor })
  }, [searchParams, data])

  const onPrevious = useCallback(async () => {
    await getProducts({variables:{
      first: null,
      last: PRODUCT_PER_PAGE,
      after: null,
      before: data.products.pageInfo.startCursor
    }})
    setSearchParams({ before: data.products.pageInfo.startCursor })
  }, [data])

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
                resourceName={{singular: 'Product', plural: 'Products'}}
                items={customData.products.edges}
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