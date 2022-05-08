import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  touringSpot: any;
  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate;
  toDate: NgbDate | null = null;
  countrySelectionActive: boolean = false;
  marinaSelectionActive: boolean = false;
  boatSeclectionActive: boolean = false;
  dateSelectionActive: boolean = true;
  marinasData: any = [
    {
      imageURL: "https://www.marinareservation.com/timthumb.php?src=upload/region/import/shutterstock_103226576.jpg&w=910&h=605&webp=1",
      name: "Gallions Point, Greater London",
      description: "Located in a beautiful secluded bay outside of Marmaris",
      marina_price: 1500,
    },
    {
      imageURL: "https://www.marinareservation.com/timthumb.php?src=upload/region/import/shutterstock_107153060.jpg&w=910&h=605&webp=1",
      name: "South Dock, Greater London.",
      description: "Located outside of Istanbul’s city centre in the Ataköy district",
      marina_price: 1600,
    },
    {
      imageURL: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/12/04/16/london.jpg?width=1200",
      name: "Howth Yacht Club and Marina. Howth, Dublin",
      description: "City with shower of love",
      marina_price: 1500,
    },
    {
      imageURL: "https://static.standard.co.uk/s3fs-public/thumbnails/image/2019/05/21/10/brighton-marina-unsplash.jpg?width=968",
      name: "Ballydavid Pier. Ballydavid",
      description: "A Strong standing desert",
      marina_price: 1500,
    }
  ]

  boatData: any = [
    {
      boat_imageURL: "https://ychef.files.bbci.co.uk/976x549/p0403466.jpg",
      boat_name: "Yatch",
      boat_description: "Located in a beautiful secluded bay outside of Marmaris",
      boat_price: 500,
    },
    {
      boat_imageURL: "https://media.istockphoto.com/photos/fast-drive-picture-id139870470?k=20&m=139870470&s=612x612&w=0&h=CERUvskeFuX7gCXTrljHd17pGyf0h81q3G8o94ZjAV8=",
      boat_name: "Speed Boat",
      boat_description: "Located outside of Istanbul’s city centre in the Ataköy district",
      boat_price: 650,
    },
    {
      boat_imageURL: "https://www.furycat.com/images/jet-ski-tour-768x432.jpg",
      boat_name: "Jet Ski",
      boat_description: "City with shower of love",
      boat_price: 400,
    },
    {
      boat_imageURL: "https://ychef.files.bbci.co.uk/976x549/p01pn16g.jpg",
      boat_name: "Sail Boat",
      boat_description: "A Strong standing desert",
      boat_price: 550,
    }
  ]

  constructor(

    public _router: Router,
    calendar: NgbCalendar
  ) {
    // The lines below initialize the dates in calender. (Calendar at the start of booking)
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
  }

  marinaSelected() {
    // When a user clicks on any Marina spot we set spot selection to false and boat selection to active
    // When user select spot we hide the screen for selecting spot and boat selection screen is set to active
    this.countrySelectionActive = false;
    this.boatSeclectionActive = true;
  }

  routeToCart() {
    this._router.navigate(["/cart"])
  }

  activeSpotSelection() {
    // when user successfully selects date or stay period and clicks submit we set date selection to false (completed)
    // and set spot selection to active (true)
    this.countrySelectionActive = true;
    this.dateSelectionActive = false;
  }

  setTouringSpot(i: any) {
    // when user clicks on spot. we received details here and set the spot details in our booking object
    this.touringSpot = i;
    this.touringSpot.person_qty = 1
    this.marinaSelected()
  }

  saveData(i: any) {
    // This is our main function where we prepare data for storing in our DB.
    // To calculate day range for stay period. We do a little bit formatting to achieve date as MM/DD/YYYY that can be used in new Date()
    var dateFrom: any = new Date(this.fromDate?.month + "/" + this.fromDate?.day + "/" + this.fromDate?.year);
    var dateTo: any = new Date(this.toDate?.month + "/" + this.toDate?.day + "/" + this.toDate?.year);
    // Here we again do a little bit formatting to store date in a readable format to post data on server
    this.touringSpot.dateFrom = this.fromDate.day + "/" + this.fromDate.month + "/" + this.fromDate.year
    this.touringSpot.dateTo = this.toDate?.day + "/" + this.toDate?.month + "/" + this.toDate?.year
    // boat data comming as i
    this.touringSpot.boat = i
    this.touringSpot.boat.boat_qty = 1
    // initialize boat_detail property that will be used to add additional detail on checkout page
    this.touringSpot.boat.boat_detail = "";
    // calculating stay period from dateFrom & dateTo above
    this.touringSpot.boat.boat_stay = (dateTo - dateFrom) / (24 * 60 * 60 * 1000);
    // after preparing data we store the bookingData object in localstorage
    // saving in localstorge so that data should remain available even after page refresh
    localStorage.setItem('bookingData', JSON.stringify(this.touringSpot))
    // navigating to cart or checkout page
    this._router.navigate(['/cart'])
  }


  // All the below four functions are from the date range picking library.
  // They worked when date is hovered & range is selected
  onDateSelection(date: NgbDate) {
    // console.log(date)
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      // console.log(this.fromDate)
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      // console.log(this.toDate)
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }
}
