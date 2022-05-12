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
import {gql, useLazyQuery, useQuery} from "@apollo/client";
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
  const [getProducts, {loading, error, data, refetch}] = useLazyQuery(GET_PRODUCTS, {
    variables: {first: PRODUCT_PER_PAGE, last: null, after:null, before:null}
  });
  const isFetched = useMemo(() => data || error, [data, error]);

  useEffect(async () => {
    await getProducts();
  }, [])


  const onNext = useCallback(() => {
    refetch({
      first: PRODUCT_PER_PAGE,
      last: null,
      after: data.products.pageInfo.endCursor,
      before: null
    })
  }, [data])

  const onPrevious = useCallback(() => {
    refetch({
      first: null,
      last: PRODUCT_PER_PAGE,
      after: null,
      before: data.products.pageInfo.startCursor
    })
  }, [data])


  if (loading || !isFetched) {
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
            <ResourceList
              resourceName={{singular: 'Product', plural: 'Products'}}
              items={data.products.edges}
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
              hasPrevious={data.products.pageInfo.hasPreviousPage}
              onPrevious={onPrevious}
              hasNext={data.products.pageInfo.hasNextPage}
              onNext={onNext}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}