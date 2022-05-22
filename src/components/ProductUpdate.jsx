import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Banner, Button, ButtonGroup, Form, FormLayout, Layout, Page, TextField} from "@shopify/polaris";
import {Loading} from "@shopify/app-bridge-react";
import {path} from "./Navigation.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {gql, useLazyQuery, useMutation} from "@apollo/client";

const GET_PRODUCT = gql`
  query getProduct($id: ID!) {
    product(id: $id) {
      title
      description
    }
  }
`

const UPDATE_PRODUCT = gql`
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        descriptionHtml
      }
    }
  } 
`


export const ProductUpdate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const {id} = useParams();
  const [getProduct, {loading, error, data}] = useLazyQuery(GET_PRODUCT, {
    fetchPolicy: 'no-cache'});
  const [productUpdate, {loading: updateLoading, error: updateError}] = useMutation(UPDATE_PRODUCT);
  const navigate = useNavigate();
  const isChanged = useMemo(() => {
    if (data) {
      return title !== data.product.title || description !== data.product.description
    }
    return false
  }, [title, description])

  useEffect(async () => {
    await getProduct({
      variables: {
        id: 'gid://shopify/Product/' + id
      }
    })
  }, [])

  useEffect(() => {
    if(data) {
      setTitle(data.product.title);
      setDescription(data.product.description)
    }
  }, [data])

  const handlerSubmit = useCallback(async () => {
    await productUpdate({
      variables: {
        input: {
          id: 'gid://shopify/Product/' + id,
          title: title,
          descriptionHtml: `<p>${description}</p>`
        }
      }
    });
    setTitle('');
    setDescription('');
    navigate(path.products);
  }, [title, description])

  const handlerTitle = useCallback((value) => {
    setTitle(value)
  }, [])

  const handlerDescription = useCallback((value) => {
    setDescription(value)
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue load product.</Banner>
    );
  }

  if (updateError) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue update product.</Banner>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Form onSubmit={handlerSubmit}>
            <FormLayout>
              <TextField
                label='Title'
                type='text'
                value={title}
                onChange={handlerTitle}
                autoComplete='off'
                disabled={updateLoading}
              />
              <TextField
                label='Description'
                type='text'
                value={description}
                onChange={handlerDescription}
                autoComplete='off'
                multiline={5}
                disabled={updateLoading}
              />
              <ButtonGroup>
                <Button onClick={() => navigate(path.products)}>Back</Button>
                <Button submit primary={!!title} disabled={!isChanged || !title} loading={updateLoading}>Update</Button>
              </ButtonGroup>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
