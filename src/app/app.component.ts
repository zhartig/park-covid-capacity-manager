import {Component, OnInit} from '@angular/core';
import * as moment from "moment";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  faAdd = faPlus;
  faRemove = faTimes;
  validTimes = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  currentDate = moment().format('YYYY-MM-DD');
  currentSide = 'large'
  reservations;
  maxMembers = 10;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.getConfig();
    this.getReservationsForDay(this.currentDate);
  }

  getConfig() {
    this.http.get('/api/config').subscribe((data: any) => this.maxMembers = data.maxMembers)
  }

  reserve(time, name) {
    this.http.post('/api/calendar/' + this.currentSide + '/' + this.currentDate + '/' + time, {name}).subscribe(data => {
      this.getReservationsForDay(this.currentDate);
    }, (err) => {
      this.openSnackBar(err.error.message || 'An unknown error occurred');
      this.getReservationsForDay(this.currentDate);
    })
  }

  cancelReserve(time) {
    this.http.delete('/api/calendar/' + this.currentDate + '/' + time).subscribe(data => {
      this.getReservationsForDay(this.currentDate);
    }, (err) => {
      this.openSnackBar(err.error.message || 'An unknown error occurred');
      this.getReservationsForDay(this.currentDate);
    })
  }

  getReservationsForDay(day) {
    this.http.get('/api/calendar/' + day).subscribe(data => this.reservations = data);
  }

  beforeNoon(time) {
    const intVal = Number.parseInt(time);
    return intVal < 12;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 5000,
      verticalPosition: 'top'
    });
  }
}
