export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: boolean | number;
}

export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}
