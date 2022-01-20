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


  marinasData: any = [
    {
      imageURL: "https://www.marinareservation.com/timthumb.php?src=upload/region/import/shutterstock_103226576.jpg&w=910&h=605&webp=1",
      name: "Gallions Point, Greater London",
      description: "Located in a beautiful secluded bay outside of Marmaris",
      price_per_person: 1500,
    },
    {
      imageURL: "https://www.marinareservation.com/timthumb.php?src=upload/region/import/shutterstock_107153060.jpg&w=910&h=605&webp=1",
      name: "South Dock, Greater London.",
      description: "Located outside of Istanbul’s city centre in the Ataköy district",
      price_per_person: 1600,
    },
    {
      imageURL: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/12/04/16/london.jpg?width=1200",
      name: "Howth Yacht Club and Marina. Howth, Dublin",
      description: "City with shower of love",
      price_per_person: 1500,
    },
    {
      imageURL: "https://static.standard.co.uk/s3fs-public/thumbnails/image/2019/05/21/10/brighton-marina-unsplash.jpg?width=968",
      name: "Ballydavid Pier. Ballydavid",
      description: "A Strong standing desert",
      price_per_person: 1500,
    }
  ]

  boatData: any = [
    {
      boat_imageURL: "https://ychef.files.bbci.co.uk/976x549/p0403466.jpg",
      boat_name: "Yatch",
      boat_description: "Located in a beautiful secluded bay outside of Marmaris",
      boat_price_per_person: 500,
    },
    {
      boat_imageURL: "https://media.istockphoto.com/photos/fast-drive-picture-id139870470?k=20&m=139870470&s=612x612&w=0&h=CERUvskeFuX7gCXTrljHd17pGyf0h81q3G8o94ZjAV8=",
      boat_name: "Speed Boat",
      boat_description: "Located outside of Istanbul’s city centre in the Ataköy district",
      boat_price_per_person: 650,
    },
    {
      boat_imageURL: "https://www.furycat.com/images/jet-ski-tour-768x432.jpg",
      boat_name: "Jet Ski",
      boat_description: "City with shower of love",
      boat_price_per_person: 400,
    },
    {
      boat_imageURL: "https://ychef.files.bbci.co.uk/976x549/p01pn16g.jpg",
      boat_name: "Sail Boat",
      boat_description: "A Strong standing desert",
      boat_price_per_person: 550,
    }
  ]

  countrySelectionActive: boolean = false;
  marinaSelectionActive: boolean = false;
  boatSeclectionActive: boolean = false;
  dateSelectionActive: boolean = true;

  constructor(
    public _router: Router,
    calendar: NgbCalendar
  ) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
  }

  marinaSelected() {
    this.countrySelectionActive = false;
    this.boatSeclectionActive = true;
  }

  routeToCart() {
    this._router.navigate(["/cart"])
  }

  activeSpotSelection() {
    this.countrySelectionActive = true;
    this.dateSelectionActive = false;
  }

  setTouringSpot(i: any) {
    this.touringSpot = i;
    this.touringSpot.person_qty = 1
    this.marinaSelected()
  }

  saveData(i: any) {
    this.touringSpot.dateFrom = this.fromDate.day + "/" + this.fromDate.month + "/" + this.fromDate.year
    this.touringSpot.dateTo = this.toDate?.day + "/" + this.toDate?.month + "/" + this.toDate?.year
    this.touringSpot.boat = i
    this.touringSpot.boat.boat_qty = 1
    this.touringSpot.boat.boat_detail = "";
    this.touringSpot.boat.boat_stay = null;
    localStorage.setItem('bookingData', JSON.stringify(this.touringSpot))
    this._router.navigate(['/cart'])
  }


  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
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
