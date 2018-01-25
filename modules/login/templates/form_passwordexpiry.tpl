<div class="container">
  <div class="panel panel-default panel-center">
    <div class="panel-heading">
      <h3 class="panel-title">Update Password</h3>
    </div>
    <div class="panel-body">
      <p><b>Password Strength Rules</b></p>
      <ul>
        <li>The password must be at least 8 characters long</li>
        <li>The password must contain at least 1 letter, 1 number and 1 character from !@#$%^*()</li>
        <li>The password and the user name must not be the same</li>
        <li>The password and the email address must not be the same</li>
      </ul>
      <form method="post">
        <div class="form-group">
          <input type="password" name="newPassword" size="40" class="form-control"
                 placeholder="New Password" />
        </div>
        <div class="form-group">
          <input type="password" name="confirmPassword" size="40" class="form-control"
                 placeholder="Confirm Password" />
          {if $error_message}
            <span id="helpBlock" class="help-block">
                <b class="text-danger">{$error_message}</b>
              </span>
          {/if}
        </div>
        <div class="form-group">
          <input type="submit" name="expiry" class="btn btn-primary btn-block"
                 value="Save"/>
        </div>
        <input type="hidden" name="login" value="false" />
        <input type="hidden" name="username" value="{$username}" />
      </form>
    </div>
  </div>
</div>
