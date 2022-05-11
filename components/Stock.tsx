import { Text, View } from 'react-native';
import { Base, Typography } from '../styles';
import StockList from './StockList.tsx'

export default function Stock({products, setProducts}) {
  return (
    <View>
      <Text style={Typography.header2}>Lagerförteckning</Text>
      <StockList products={products} setProducts={setProducts}/>
    </View>
  );
}
