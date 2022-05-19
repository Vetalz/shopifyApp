import React from 'react';
import {Page, Layout, Card, TextStyle} from "@shopify/polaris";
import {size} from "lodash/collection.js";

export const Home = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section oneHalf>
          <Card title="Active products:">
            <Card.Section>
              <h1 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>6</h1>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card title="Draft products:">
            <Card.Section>
              <h1 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>2</h1>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Total products:">
            <Card.Section>
              <h1 style={{fontSize: '72px', textAlign: 'center', marginBottom: '20px'}}>8</h1>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};