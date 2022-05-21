import React, {useEffect} from 'react';
import {Page, Layout, Card, Spinner, Button} from "@shopify/polaris";
import {useNavigate} from "react-router-dom";
import {path} from "../Navigation.jsx";

export const Home = ({allCount, activeCount, draftCount, getAllCount, getActiveCount, getDraftCount}) => {
  let navigate = useNavigate();

  useEffect(() => {
    getAllCount();
    getActiveCount();
    getDraftCount();
  }, []);

  return (
    <Page>
      <Layout>
        <Layout.Section oneHalf>
          <Card title="Active products:">
            <Card.Section>
              <h1 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>
                {activeCount
                  ? activeCount
                  : <Spinner accessibilityLabel="Spinner example" size="small" />}
              </h1>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card title="Draft products:">
            <Card.Section>
              <h1 style={{fontSize: '48px', textAlign: 'center', marginBottom: '20px'}}>
                {draftCount
                  ? draftCount
                  : <Spinner accessibilityLabel="Spinner example" size="small" />}
              </h1>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Total products:">
            <Card.Section>
              <h1 style={{fontSize: '72px', textAlign: 'center', marginBottom: '20px'}}>
                {allCount
                  ? allCount
                  : <Spinner accessibilityLabel="Spinner example" size="large" />}
              </h1>
            </Card.Section>
            <Card.Section>
                <Button fullWidth primary onClick={() => navigate(path.add)}>Add product</Button>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};