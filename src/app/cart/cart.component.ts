import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../Services/global.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StripeService, StripeCardComponent } from "ngx-stripe";
import {
  StripeCardElementOptions,
  StripeElementsOptions
} from "@stripe/stripe-js";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  // Controlling Bootstrap Popup
  @ViewChild('myModal') myModal: any;
  // Controlling Stripe Card -> Required By Stripe
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  stripeName: string = "";

  bookingData: any
  tab1: boolean = true;
  tab2: boolean = false;
  tab3: boolean = false;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  contact?: string;
  additionalInfo?: string;
  creditCard?: boolean = false;
  creditCardNumber?: string;
  paypal?: boolean = false;
  stripe?: boolean = false;
  status: string = "Pending";
  model!: NgbDateStruct;
  closeResult = '';

  action: boolean = true;
  setAutoHide: boolean = true;
  autoHide: number = 2000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  addExtraClass: boolean = true;

  public payPalConfig?: IPayPalConfig;
  totalBilling: string = '0';
  showPaymentDailog: boolean = false;


  // Stripe Card Properties
  elementsOptions: StripeElementsOptions = {
    locale: "en"
  };

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: "40px",
        fontWeight: "300",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "18px",
        "::placeholder": { color: "#CFD7E0" }
      }
    }
  };

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public global: GlobalService,
    private stripeService: StripeService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    // initConfig is a function that initialize paypal checkout card based on your client ID
    // The details in the functions are provided by the ngx-paypal library
    this.initConfig();

    // getting the data from localstorage that we saved earlier to add bit more detail before we post it on server
    var bookingData: any = localStorage.getItem('bookingData');
    this.bookingData = JSON.parse(bookingData)
    console.log(this.bookingData)
  }

  selectCreditCard() {
    // when credit card is selected, set Paypal and stripe to false
    this.creditCard = true;
    this.paypal = false
    this.stripe = false
  }

  selectPaypal() {
    // when Paypal is selected, set Credit Card and Stripe to false
    this.creditCard = false;
    this.paypal = true;
    this.stripe = false;
  }

  selectStripe() {
    // when Stripe is selected, set Paypal and Credit Card to false
    this.creditCard = false;
    this.paypal = false;
    this.stripe = true;
  }

  switchTab() {
    // Controlling Tab Screen View By Hiding & Showing it.
    if (this.tab1 == true) {
      this.tab2 = true;
      this.tab1 = false;
      this.tab3 = false;
    }
    else if (this.tab2 == true) {
      this.tab2 = false;
      this.tab1 = false;
      this.tab3 = true;
    }
  }

  PaymentProcess(content?: any) {
    // first step, we prepare data
    this.finalizeData();

    // if Paypal is true. Open Paypal Dialog
    if (this.paypal) {
      this.open(content);
    }
    else if (this.stripe) {
      // if Stripe payment is true call stripe API. 
      this.stripePayment();
    }
    else {
      // If Credit Card is selected we show spinner and call finalize booking and post Data
      this.spinner.show()
      this.finalizeBooking();
    }
  }

  finalizeBooking() {
    // Printing bookingData object 
    console.log(JSON.stringify(this.bookingData, undefined, 2))
    // Posting Object
    this.global.postBookingData(this.bookingData).subscribe(
      (data) => {
        // When operation is completed
        // 1) Hide Spinner
        // 2) Show Snackbar Message 
        // 3) Route to Main Page After 4.2 Seconds
        this.spinner.hide()
        this.openSnackBar("Thanks For Booking, Your Spot Has Been Fixed From " + this.bookingData.dateFrom + " to " + this.bookingData.dateTo + " !", "success")
        setTimeout(() => {
          this.router.navigate(["/"])
        }, 4200);
        console.log(data)
      }, (err) => {
        this.spinner.hide()
        this.openSnackBar("Error ! Your Booking Cannot Be Confirmed At the moment. Please Try Again Later.", "danger")
        console.log(err)
      }
    )
  }

  finalizeData() {
    // Calulating Total Bill / Price
    var totalBilling = 1 * this.bookingData.marina_price + this.bookingData.boat.boat_qty * this.bookingData.boat.boat_price
    // We change total billing property to string. Reason: we set this property in Papyal where the required type is string 
    // therefore we need to set it up as string
    this.totalBilling = totalBilling.toString()

    // setting user details obtained from the form in bookingData object
    this.bookingData.firstName = this.firstName
    this.bookingData.lastName = this.lastName
    this.bookingData.number = this.phoneNumber
    this.bookingData.address = this.address
    this.bookingData.email = this.email
    this.bookingData.contact = this.contact
    this.bookingData.additionalInfo = this.additionalInfo

    if (this.creditCard) {
      // if user selects credit card we set payment type credit card and add creadit card number
      this.bookingData.creditCard = true
      this.bookingData.creditCardNumber = this.creditCardNumber
    }
    else if (this.paypal) {
      // if user selects Paypal, we set payment type of Paypal set to true
      this.bookingData.paypal = true
    }
    else if (this.stripe) {
      // if user selects Stripe, we set payment type of Stripe set to true
      this.bookingData.stripe = true
    }
    else {
      // Default Case
      this.bookingData.creditCard = true
      this.bookingData.creditCardNumber = this.creditCardNumber
    }
    // Setting Booking Status to Confirmed
    this.bookingData.status = "Confirmed"
  }

  openSnackBar(message: any, action?: string) {
    this.global.openSnackBar(message, action)
  }

  private initConfig(): void {
    this.payPalConfig = {
      // Your Paypal Client ID Here
      clientId: "ATeDj0dEeI-27oJa8EVZwqIYeaW-Je2it8H8VxDtTXs1bTLISChtWiwJ_AgmM0eH6pPEh9dbjsZfCRJW",
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "GBP",
                value: this.totalBilling,
                breakdown: {
                  item_total: {
                    currency_code: "GBP",
                    value: this.totalBilling
                  }
                }
              },
              items: [
                {
                  // Here is the Name of operation for which Payment is received
                  name: "Booking For Marina Spot",
                  quantity: '1',
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: "GBP",
                    // Total Bill Value that was calculated in FinalizeData function
                    value: this.totalBilling
                  }
                }
              ]
            }
          ]
        },
      advanced: {
        commit: "true"
      },
      style: {
        label: "paypal",
        layout: "vertical"
      },
      onApprove: (data, actions) => {
        console.log(
          "onApprove - transaction was approved, but not authorized",
          data,
          actions
        );
        actions.order.get().then((details: any) => {
          console.log(
            "onApprove - you can get full order details inside onApprove: ",
            details
          );

          this.finalizeBooking()
        });
      },
      onClientAuthorization: data => {
        console.log(
          "onClientAuthorization - you should probably inform your server about completed transaction at this point",
          data
        );
      },
      onCancel: (data, actions) => {
        console.log("OnCancel", data, actions);
      },
      onError: err => {
        console.log("OnError", err);
      },
      onClick: (data, actions) => {
        console.log("onClick", data, actions);
      }
    };
  }

  open(content: any) {
    // Ng-Bootstrap Popup . Used to Open Paypal Popup
    this.showPaymentDailog = true;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    // NG-Bootstrap Popup Function. Called when popup is closed
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  stripePayment(): void {
    // This function is called when payment type is set to stripe
    // setting Customer Firstname
    var name: any = this.firstName
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // If token is returned from the Stripe API we proceed to finalizaBooking Function 
          console.log(result.token.id);
          this.finalizeBooking();
        } else if (result.error) {
          // Error creating the token
          // Incase of error show snackBar
          console.log(result.error.message);
          this.openSnackBar(result.error.message, "danger")
        }
      });
  }
}
