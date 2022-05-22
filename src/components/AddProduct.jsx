import React, {useCallback, useState} from 'react';
import {Page, Layout, Form, FormLayout, TextField, Button, ButtonGroup} from "@shopify/polaris";
import {path} from "./Navigation.jsx";
import {useNavigate} from "react-router-dom";
import {gql, useMutation} from "@apollo/client";

const CREATE_PRODUCT = gql`
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        title
        descriptionHtml
      }
    }
  }
`

export const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [productCreate, {loading, error}] = useMutation(CREATE_PRODUCT);

  const handlerTitle = useCallback((value) => {
    setTitle(value)
  }, [])

  const handlerDescription = useCallback((value) => {
    setDescription(value)
  }, [])

  const handlerSubmit = useCallback(async () => {
    await productCreate({
      variables: {
        input: {
          title: title,
          descriptionHtml: `<p>${description}</p>`
        }
      }
    });
    setTitle('');
    setDescription('');
    navigate(path.products);
  }, [title, description])

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
                disabled={loading}
              />
              <TextField
                label='Description'
                type='text'
                value={description}
                onChange={handlerDescription}
                autoComplete='off'
                multiline={5}
                disabled={loading}
              />
              <ButtonGroup>
                <Button onClick={() => navigate(path.products)}>Back</Button>
                <Button submit primary={!!title} disabled={!title} loading={loading}>Save</Button>
              </ButtonGroup>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
