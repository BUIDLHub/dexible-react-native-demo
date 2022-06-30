import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  Button,
} from 'react-native';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// IMPORTANT! - DO NOT USE @ethersproject/shims to generate wallets!!!
// see: https://docs.ethers.io/v5/cookbook/react-native/#cookbook-reactnative
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"

import { ethers } from 'ethers';
import { SDK } from 'dexible-sdk';


export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      sdk: null,
      isLoading: true,
      tokenAddress: '',
      tokenResponse: '',
    };

  }

  componentDidMount() {
    this.initDexibleSdk();
  }

  async initDexibleSdk() {

    // TODO: add proper wallet handling
    let error;
    let sdk;
    let wallet;
    try {
      wallet = await ethers.Wallet.createRandom();

      const provider = new ethers.providers.CloudflareProvider();

      sdk = await SDK.create({
        provider,
        signer: wallet,
      });
    } catch (e) {
      console.log(e);
      error = e;
    }

    this.setState({
      error,
      isLoading: false,
      sdk,
    });

    return sdk;
  }

  async onChangeTokenAddress(value) {

    const { sdk } = this.state;

    this.setState({
      tokenAddress: value,
      tokenResponse: '',
      isLoading: value ? true : false,
    });

    if (value) {
      const response = await sdk.token.lookup(value);
      this.setState({
        tokenResponse: response,
        isLoading: false,
      });
    }

  }

  render() {
    const {
      sdk,
      isLoading,
      error,
      tokenAddress,
      tokenResponse,
    } = this.state;
    return (
      <View style={styles.container}>
        <Image
          style={{
            height: 150,
            width: 150,
          }}
          source={{ uri: 'https://pbs.twimg.com/profile_images/1492215203383189505/fjFrPtxD_400x400.jpg' }}
        />
        {error
          ? (
            <View style={styles.error}>
              {error.toString()}
            </View>
          )
          : null
        }

        {isLoading
          ? (<View>
            <ActivityIndicator />
            <Text>Loading SDK</Text>
          </View>
          )
          : (
            <View>
              <SafeAreaView>
                <Text>Sample Tokens:</Text>
                <Button
                  onPress={() => this.onChangeTokenAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')}
                  style={styles.input}
                  title='WETH'
                />
                <Button
                  onPress={() => this.onChangeTokenAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')}
                  style={styles.input}
                  title='USDC'
                />

                <Text>Token Address:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={this.onChangeTokenAddress}
                  value={tokenAddress}
                />
              </SafeAreaView>
              <Text>Token Lookup Results:</Text>
              <Text>{JSON.stringify(tokenResponse, null, 2)}</Text>

            </View>
          )
        }

        <StatusBar style="auto" />
      </View>
    );
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    padding: 12,
    borderWidth: 1,
    padding: 10,
  },
  error: {
    color: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
