import { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput, Button, Picker, Platform, View } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Base, Typography, Forms } from '../styles';
import productModel from "../models/products";
import deliveryModel from "../models/delivery";
import Delivery from '../interfaces/delivery';
import Product from '../interfaces/product';
import { showMessage } from "react-native-flash-message";

function ProductDropDown(props) {
    const [products, setProducts] = useState<Product[]>([]);
    let productsHash: any = {};

    useEffect(async () => {
        setProducts(await productModel.getProducts());
    }, []);

    const itemsList = products.map((prod, index) => {
        productsHash[prod.id] = prod;
        return <Picker.Item key={index} label={prod.name} value={prod.id} />;
    });

    return (
        <Picker
            selectedValue={props.delivery?.product_id}
            onValueChange={(itemValue) => {
                props.setDelivery({ ...props.delivery, product_id: itemValue });
                props.setCurrentProduct(productsHash[itemValue]);
            }}>
            {itemsList}
        </Picker>
    );
}

function DateDropDown(props) {
    const [dropDownDate, setDropDownDate] = useState<Date>(new Date());
    const [show, setShow] = useState<Boolean>(false);

    const showDatePicker = () => {
        setShow(true);
    };

    return (
        <View>
            {Platform.OS === "android" && (
                <Button onPress={showDatePicker} title="Visa datumväljare" />
            )}
            {(show || Platform.OS === "ios") && (
                <DateTimePicker
                    onChange={(event, date) => {
                        setDropDownDate(date);

                        props.setDelivery({
                            ...props.delivery,
                            delivery_date: date.toLocaleDateString('se-SV'),
                        });

                        setShow(false);
                    }}
                    value={dropDownDate}
                />
            )}
        </View>
    );
}

export default function DeliveryForm({ navigation, setDeliveries, setProducts }) {
    const [delivery, setDelivery] = useState<Partial<Delivery>>({});
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

    async function addDelivery() {
        await deliveryModel.addDelivery(delivery);
    
        const updatedProduct = {
            ...currentProduct,
            stock: (currentProduct.stock || 0) + (delivery.amount || 0)
        };

        await productModel.updateProduct(updatedProduct)
    
        setDeliveries(await deliveryModel.getDeliveries());
        setProducts(await productModel.getProducts());
    
        navigation.navigate("List", { reload: true });
    }

    return (
        <ScrollView style={{ ...Base.base }}>
            <Text style={{ ...Typography.header2 }}>Ny inleverans</Text>

            <Text style={{ ...Typography.label }}>PRODUKT</Text>
            <ProductDropDown
                delivery={delivery}
                setDelivery={setDelivery}
                setCurrentProduct={setCurrentProduct}
            />

            <Text style={{ ...Typography.label }}>DATUM</Text>
            <DateDropDown
                delivery={delivery}
                setDelivery={setDelivery}
            />

            <Text style={{ ...Typography.label }}>KOMMENTAR</Text>
            <TextInput
                style={{ ...Forms.input }}
                onChangeText={(content: string) => {
                    setDelivery({ ...delivery, comment: content })
                }}
                value={delivery?.comment}
            />

            <Text style={{ ...Typography.label }}>ANTAL</Text>
            <TextInput
                style={{ ...Forms.input }}
                onChangeText={(content: string) => {
                    setDelivery({ ...delivery, amount: parseInt(content) })
                }}
                value={delivery?.amount?.toString()}
                keyboardType="numeric"
            />

            <Button
                title="Gör inleverans"
                onPress={() => {
                    if (delivery.product_id && delivery.comment && delivery.delivery_date && delivery.amount) {
                        addDelivery();
                    } else {
                        showMessage({
                            message: "Saknas",
                            description: "Ett av fälten är ej korrekt ifyllt",
                            type: "warning",
                        });
                    }
                }}
            />
        </ScrollView>
    );
};