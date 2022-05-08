import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../Services/global.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  adminCredentials: any;
  email?: string;
  password?: string;
  newPassword?: string;
  isLogin: boolean = true;
  isChangePassword: boolean = false;

  constructor(public router: Router, public global: GlobalService) { }

  ngOnInit(): void {
    this.global.getIDpass().subscribe(
      (data) => {
        this.adminCredentials = data[0]
        // console.log(this.adminCredentials)
      },
      (err) => {
        // console.log(err)
      }
    )
  }

  activeChangePassword() {
    // Setting Change Password Screen Active
    this.isChangePassword = true;
    this.isLogin = false;
  }

  login() {
    if (this.isLogin) {
      // if login screen is active check if email or password is not null or undefined
      if ((this.email != undefined || this.email != null) && (this.password != undefined || this.password != null)) {
        if ((this.email.toLowerCase() == this.adminCredentials.name) && (this.password == this.adminCredentials.password)) {
          // if email and password matches
          // show login successull message and route to admin panel
          this.openSnackBar("Login Successful", "success")
          this.router.navigate(["/admin"])
          this.global.isLogin = true
          localStorage.setItem("isLogin", JSON.stringify(this.global.isLogin))
        }
        else {
          // if email or password is incorrect show error !
          this.openSnackBar("Email or Password is Incorrect", "danger")
        }
      }
      else {
        // if email or password is incorrect show error !
        this.openSnackBar("Email or Password is Empty", "danger")
      }
    }
    else if (this.isChangePassword) {
      // If Change Password is Active Call Update password API
      var obj = {
        password: this.password,
        newpassword: this.newPassword
      }
      this.global.updatePassword(obj)
    }
  }

  openSnackBar(message: string, action?: string) {
    // we have set up a basic snackbar showing method in global service
    // the first parameter receive message and the other on receive action
    // if action == success -> show blue popup 
    // if action == danger -> show red popup
    this.global.openSnackBar(message, action)
  }

}
