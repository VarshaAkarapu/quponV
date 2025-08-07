// Font Update Script for Qupon App
// This script lists all the key text styles that need to be updated

// Key screens and their text styles to update:

// 1. homeScreen.js
// - searchResultsTitle: Use TEXT_STYLES.SECTION_TITLE
// - searchResultBrand: Use TEXT_STYLES.SUB_HEADING
// - searchResultTitle: Use TEXT_STYLES.BODY_TEXT
// - searchResultCategory: Use TEXT_STYLES.CAPTION_TEXT
// - brandSuggestionName: Use TEXT_STYLES.SUB_HEADING
// - brandSuggestionSubtext: Use TEXT_STYLES.CAPTION_TEXT
// - categorySuggestionName: Use TEXT_STYLES.SUB_HEADING
// - categorySuggestionSubtext: Use TEXT_STYLES.CAPTION_TEXT
// - dealCardTitle: Use TEXT_STYLES.SUB_HEADING
// - dealCardBrand: Use TEXT_STYLES.LABEL
// - dealCardPrice: Use TEXT_STYLES.PRICE_TEXT
// - dealCardOriginalPrice: Use TEXT_STYLES.CAPTION_TEXT
// - dealCardDiscount: Use TEXT_STYLES.LABEL
// - categoryCardTitle: Use TEXT_STYLES.SUB_HEADING
// - categoryCardSubtitle: Use TEXT_STYLES.CAPTION_TEXT
// - brandCardTitle: Use TEXT_STYLES.SUB_HEADING
// - brandCardSubtitle: Use TEXT_STYLES.CAPTION_TEXT
// - aboutUsTitle: Use TEXT_STYLES.HEADING
// - aboutUsSubtitle: Use TEXT_STYLES.SUB_HEADING
// - aboutUsText: Use TEXT_STYLES.BODY_TEXT

// 2. browseDealsScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - filterButtonText: Use TEXT_STYLES.BUTTON_PRIMARY
// - couponCardTitle: Use TEXT_STYLES.SUB_HEADING
// - couponCardBrand: Use TEXT_STYLES.LABEL
// - couponCardPrice: Use TEXT_STYLES.PRICE_TEXT
// - couponCardOriginalPrice: Use TEXT_STYLES.CAPTION_TEXT
// - couponCardDiscount: Use TEXT_STYLES.LABEL
// - couponCardDescription: Use TEXT_STYLES.BODY_TEXT
// - couponCardCategory: Use TEXT_STYLES.CAPTION_TEXT
// - modalTitle: Use TEXT_STYLES.HEADING
// - modalBrand: Use TEXT_STYLES.SUB_HEADING
// - modalPrice: Use TEXT_STYLES.PRICE_TEXT
// - modalDescription: Use TEXT_STYLES.BODY_TEXT
// - modalTerms: Use TEXT_STYLES.CAPTION_TEXT
// - buyButtonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 3. uploadCouponScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - sectionTitle: Use TEXT_STYLES.SECTION_TITLE
// - inputLabel: Use TEXT_STYLES.INPUT_LABEL
// - inputText: Use TEXT_STYLES.INPUT_TEXT
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY
// - errorText: Use TEXT_STYLES.CAPTION_TEXT
// - successText: Use TEXT_STYLES.CAPTION_TEXT

// 4. profileScreen.js (already partially updated)
// - title: Use TEXT_STYLES.NAV_TITLE ✓
// - userName: Use TEXT_STYLES.SUB_HEADING ✓
// - sectionTitle: Use TEXT_STYLES.SECTION_TITLE ✓
// - infoLabel: Use TEXT_STYLES.LABEL
// - infoValue: Use TEXT_STYLES.BODY_TEXT
// - tabText: Use TEXT_STYLES.NAVIGATION
// - activeTabText: Use TEXT_STYLES.NAVIGATION
// - couponCardTitle: Use TEXT_STYLES.SUB_HEADING
// - couponCardBrand: Use TEXT_STYLES.LABEL
// - couponCardPrice: Use TEXT_STYLES.PRICE_TEXT
// - modalTitle: Use TEXT_STYLES.HEADING
// - modalLabel: Use TEXT_STYLES.INPUT_LABEL
// - modalInput: Use TEXT_STYLES.INPUT_TEXT
// - saveButtonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 5. loginScreen.js (already updated)
// - appName: Use TEXT_STYLES.BRAND_LOGO ✓
// - tagline: Use TEXT_STYLES.BODY_TEXT
// - loginHeading: Use TEXT_STYLES.SUB_HEADING
// - countryCodeText: Use TEXT_STYLES.INPUT_TEXT
// - input: Use TEXT_STYLES.INPUT_TEXT
// - checkboxText: Use TEXT_STYLES.BODY_TEXT
// - linkText: Use TEXT_STYLES.BUTTON_SECONDARY
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 6. otpVerificationScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - phoneText: Use TEXT_STYLES.BODY_TEXT
// - otpInput: Use TEXT_STYLES.INPUT_TEXT
// - resendText: Use TEXT_STYLES.BUTTON_SECONDARY
// - verifyButtonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 7. registrationScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - sectionTitle: Use TEXT_STYLES.SECTION_TITLE
// - inputLabel: Use TEXT_STYLES.INPUT_LABEL
// - inputText: Use TEXT_STYLES.INPUT_TEXT
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY
// - errorText: Use TEXT_STYLES.CAPTION_TEXT

// 8. purchasedCouponsScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - couponCardTitle: Use TEXT_STYLES.SUB_HEADING
// - couponCardBrand: Use TEXT_STYLES.LABEL
// - couponCardPrice: Use TEXT_STYLES.PRICE_TEXT
// - couponCardStatus: Use TEXT_STYLES.STATUS_TEXT

// 9. uploadedCouponsScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - couponCardTitle: Use TEXT_STYLES.SUB_HEADING
// - couponCardBrand: Use TEXT_STYLES.LABEL
// - couponCardPrice: Use TEXT_STYLES.PRICE_TEXT
// - couponCardStatus: Use TEXT_STYLES.STATUS_TEXT

// 10. userLevelScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - levelTitle: Use TEXT_STYLES.HEADING
// - levelSubtitle: Use TEXT_STYLES.SUB_HEADING
// - levelDescription: Use TEXT_STYLES.BODY_TEXT
// - benefitTitle: Use TEXT_STYLES.SUB_HEADING
// - benefitDescription: Use TEXT_STYLES.BODY_TEXT

// 11. userInformationScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - sectionTitle: Use TEXT_STYLES.SECTION_TITLE
// - inputLabel: Use TEXT_STYLES.INPUT_LABEL
// - inputText: Use TEXT_STYLES.INPUT_TEXT
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 12. paymentScreen.js
// - title: Use TEXT_STYLES.NAV_TITLE
// - paymentTitle: Use TEXT_STYLES.HEADING
// - paymentSubtitle: Use TEXT_STYLES.SUB_HEADING
// - couponCode: Use TEXT_STYLES.COUPON_CODE
// - priceText: Use TEXT_STYLES.PRICE_TEXT
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY

// 13. admin screens (if any)
// - title: Use TEXT_STYLES.NAV_TITLE
// - sectionTitle: Use TEXT_STYLES.SECTION_TITLE
// - tableHeader: Use TEXT_STYLES.LABEL
// - tableCell: Use TEXT_STYLES.BODY_TEXT
// - buttonText: Use TEXT_STYLES.BUTTON_PRIMARY

// Implementation Steps:
// 1. Add import: import { TEXT_STYLES } from '../config/fontConfig';
// 2. Replace fontSize and fontWeight with TEXT_STYLES.[STYLE_NAME]
// 3. Keep color and other properties as they are
// 4. Test each screen to ensure proper rendering

export default {
  // This is a reference document for font updates
  // Each screen should be updated individually
};
