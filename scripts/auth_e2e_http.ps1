$ErrorActionPreference = 'Stop'
$report = [ordered]@{ steps = @(); errors = @() }
$timestamp = Get-Date -UFormat %s
$email = "e2e_user_$timestamp@example.com"
$password = 'Password123!'
$name = 'E2E Tester'
$backend = 'http://localhost:3001'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Save-Report() {
    $report | ConvertTo-Json -Depth 6 | Out-File -FilePath "d:\auth_e2e_http_report.json" -Encoding utf8
}

try {
    $report.steps += @{ step = 'start'; email = $email }

    # 1. Signup
    $body = @{ email = $email; password = $password; name = $name } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$backend/api/auth/signup" -Method Post -Body $body -ContentType 'application/json' -WebSession $session
    $report.steps += @{ step = 'signup'; response = $res }

    # 2. Verify OTP (use dev bypass 123456)
    $body = @{ email = $email; otp = '123456'; name = $name } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$backend/api/auth/verify-otp" -Method Post -Body $body -ContentType 'application/json' -WebSession $session
    $report.steps += @{ step = 'verify_otp'; response = $res }

    # 3. Get /me
    Start-Sleep -Milliseconds 500
    $me = Invoke-RestMethod -Uri "$backend/api/auth/me" -Method Get -WebSession $session
    $report.steps += @{ step = 'me_after_verify'; response = $me }

    # 4. Logout then Login to validate session flows
    $logout = Invoke-RestMethod -Uri "$backend/api/auth/logout" -Method Post -WebSession $session
    $report.steps += @{ step = 'logout'; response = $logout }

    # Login
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$backend/api/auth/login" -Method Post -Body $body -ContentType 'application/json' -WebSession $session
    $report.steps += @{ step = 'login'; response = $login }

    # 5. Update profile
    $body = @{ name = 'E2E Updated'; profession = 'QA' } | ConvertTo-Json
    $update = Invoke-RestMethod -Uri "$backend/api/auth/update-profile" -Method Post -Body $body -ContentType 'application/json' -WebSession $session
    $report.steps += @{ step = 'update_profile'; response = $update }

    # 6. Redeem coupon
    $body = @{ couponCode = 'VIP2026' } | ConvertTo-Json
    $coupon = Invoke-RestMethod -Uri "$backend/api/payments/coupon" -Method Post -Body $body -ContentType 'application/json' -WebSession $session
    $report.steps += @{ step = 'redeem_coupon'; response = $coupon }

    # 7. Delete account
    $del = Invoke-RestMethod -Uri "$backend/api/auth/delete-account" -Method Post -WebSession $session
    $report.steps += @{ step = 'delete_account'; response = $del }

    # 8. Get /me after delete (should fail)
    try {
        $meAfter = Invoke-RestMethod -Uri "$backend/api/auth/me" -Method Get -WebSession $session
        $report.steps += @{ step = 'me_after_delete'; response = $meAfter }
    } catch {
        $report.steps += @{ step = 'me_after_delete'; response = $_.Exception.Response.StatusCode.Value__ }
    }

} catch {
    $report.errors += $_.Exception.Message
    $report.steps += @{ step = 'error_at'; message = $_.Exception.Message }
} finally {
    Save-Report()
    Write-Output "Wrote d:\auth_e2e_http_report.json"
}
