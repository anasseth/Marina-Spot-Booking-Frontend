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
        console.log(this.adminCredentials)
      },
      (err) => {
        console.log(err)
      }
    )
  }

  activeChangePassword() {
    this.isChangePassword = true;
    this.isLogin = false;
  }

  login() {
    if (this.isLogin) {
      if ((this.email != undefined || this.email != null) && (this.password != undefined || this.password != null)) {
        if ((this.email.toLowerCase() == this.adminCredentials.name) && (this.password == this.adminCredentials.password)) {
          // alert("Login Successful")
          this.openSnackBar("Login Successful", "success")
          this.router.navigate(["/admin"])
          this.global.isLogin = true
          localStorage.setItem("isLogin", JSON.stringify(this.global.isLogin))
        }
        else {
          // alert("Email or Password is Incorrect")
          this.openSnackBar("Email or Password is Incorrect", "danger")
          console.log(this.email)
          console.log(this.password)
        }
      }
      else {
        // alert("Email or Password is Empty")
        this.openSnackBar("Email or Password is Empty", "danger")
      }
    }
    else if (this.isChangePassword) {
      var obj = {
        password: this.password,
        newpassword: this.newPassword
      }
      // this.global.updatePassword(obj)
    }
  }

  openSnackBar(message: string, action?: string) {
    this.global.openSnackBar(message, action)
  }

}
