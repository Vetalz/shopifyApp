import {
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Pagination,
  Page,
  Layout,
  Banner,
  Thumbnail, Button
} from "@shopify/polaris";
import {gql, useLazyQuery} from "@apollo/client";
import {Loading} from "@shopify/app-bridge-react";
import {useCallback, useEffect, useMemo, useState} from "react";

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
  const [isFetched, setIsFetched] = useState(false)
  const [getProducts, {loading, error, data, previousData}] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'no-cache',
    variables: {first: PRODUCT_PER_PAGE, last: null, after:null, before:null}
  });
  const customData = useMemo(() => loading ? previousData : data, [loading, data])

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
  }, [data])

  const onPrevious = useCallback(async () => {
    await getProducts({variables:{
      first: null,
      last: PRODUCT_PER_PAGE,
      after: null,
      before: data.products.pageInfo.startCursor
    }})
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