import CustomKeyboardView from '@/components/CustomKeyboardView';
import { useAuth } from '@/context/authContext';
import { contactCollection, userRef } from '@/firebaseConfig';
import { Contact, User } from '@/types';
import { useRouter} from 'expo-router';
import { getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {View, Button, StyleSheet, Text, TouchableOpacity, TextInput} from 'react-native';
import {AlphabetList, IData} from 'react-native-section-alphabet-list';

export default function AddContact()  {
    const router = useRouter();
    const {user} = useAuth();
    const [email, onChangeEmail] = useState<string>();
    const [userContacts, setUserContacts] = useState<User[]>();

    useEffect(() => {
        getContacts();
    }, []);


    const getContacts = async () => {
        try {
            const contactsContainer : Contact[] = [];
            const q = query(contactCollection, where('ownerId', '==', user.id));
            const qSnapshot = await getDocs(q);
            qSnapshot.forEach((doc) => {contactsContainer.push(doc.data() as Contact)});
            getUsersFromContacts(contactsContainer);
        } catch (error) {
            console.error("Error fetching contact:", error);
        }
    }

    const getUsersFromContacts = async (contacts: Contact[]) => {
        const promises = contacts.map(async (contact) => {
            const q = query(userRef, where('id', '==', contact.contactUserId));
            const qSnapshot = await getDocs(q);
            const user : User[] = [];
            qSnapshot.forEach((doc) => {
                user.push(doc.data() as User);
            })
            return user;
        });

        const result = await Promise.all(promises);
        const usersContainer : User[] = result.flat();
        setUserContacts(usersContainer);
    }


    const verifyEmail = () => {
        if (!email) {
            alert("Please enter an email address");
            return false;
        }
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(regex.test(email)){
            return true;
        } else {
            alert("Please enter a valid email");
            return false;
        }
    }   


    const handleSearch = () => {
        if(verifyEmail()) {
            router.push({pathname: '/(app)/ConfirmContact', params: {email: email}})
        }
    }

    const sendToChatRoom = (item: IData) => {
        router.replace({pathname: '/(app)/chatRoom', params: {contactID: item.key}});
    }

    return (
                <View className='flex-1 flex-col justify-center items-center'>
                    <TextInput onChangeText={onChangeEmail} style={styles.input} placeholder='Enter an Email' keyboardType='email-address'/>
                    <Button title='Search' onPress={handleSearch}/>
                    {
                        userContacts && 
                        <AlphabetList
                            data={userContacts.map((contact) => ({
                                key: contact.id!,
                                value: contact.firstName, // or contact.email, depending on what you want to display
                                ...contact
                            }))}
                            indexLetterStyle={{ 
                                color: 'blue', 
                                fontSize: 15,
                            }}
                            renderCustomItem={(item) => (
                                <TouchableOpacity onPress={() => {sendToChatRoom(item)}}>
                                    <View>
                                        <Text>{item.value} {}</Text>
                                    </View>
                                </TouchableOpacity>

                            )}
                        />
                    }
                </View>
    )
}




const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});