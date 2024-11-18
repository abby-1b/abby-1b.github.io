function clickedProject(projectElement) {
    open(projectElement.getAttribute("link"));
}
function makeWiggle(el) {
    const inner = el.innerText;
    const chars = inner.split('').map((c)=>c == ' ' ? '&nbsp;' : c);
    el.innerHTML = chars.map((c)=>{
        const delay = ~~(Math.random() * 400);
        const time = Math.random() * 0.5 + 0.5;
        return `<span class='wiggleChar' style='animation-duration:${time}s;animation-delay:${delay}ms'>${c}</span>`;
    }).join('');
}
window.addEventListener('load', ()=>{
    const wiggleElements = document.querySelectorAll('.wiggle');
    [
        ...wiggleElements
    ].forEach(makeWiggle);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKiBSdW5zIHdoZW4gYSBwcm9qZWN0IGlzIGNsaWNrLCBkaXJlY3RpbmcgdGhlIHVzZXIgdG8gdGhlIGRlc2lyZWQgd2Vic2l0ZSAqL1xuZnVuY3Rpb24gY2xpY2tlZFByb2plY3QocHJvamVjdEVsZW1lbnQpIHtcblx0b3Blbihwcm9qZWN0RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJsaW5rXCIpKTtcbn1cblxuLyoqIE1ha2VzIHRoZSB0ZXh0IHdpdGhpbiB0aGUgZWxlbWVudCB3aWdnbGUhICovXG5mdW5jdGlvbiBtYWtlV2lnZ2xlKGVsOiBIVE1MRWxlbWVudCkge1xuXHRjb25zdCBpbm5lciA9IGVsLmlubmVyVGV4dDtcblx0Y29uc3QgY2hhcnMgPSBpbm5lci5zcGxpdCgnJykubWFwKGMgPT4gYyA9PSAnICcgPyAnJm5ic3A7JyA6IGMpO1xuXHRlbC5pbm5lckhUTUwgPVxuXHRcdGNoYXJzLm1hcChjID0+IHtcblx0XHRcdGNvbnN0IGRlbGF5ID0gfn4oTWF0aC5yYW5kb20oKSAqIDQwMCk7XG5cdFx0XHRjb25zdCB0aW1lID0gTWF0aC5yYW5kb20oKSAqIDAuNSArIDAuNTtcblx0XHRcdHJldHVybiBgPHNwYW4gY2xhc3M9J3dpZ2dsZUNoYXInIHN0eWxlPSdhbmltYXRpb24tZHVyYXRpb246JHt0aW1lfXM7YW5pbWF0aW9uLWRlbGF5OiR7ZGVsYXl9bXMnPiR7Y308L3NwYW4+YFxuXHRcdH0pXG5cdFx0LmpvaW4oJycpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblx0Y29uc3Qgd2lnZ2xlRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcud2lnZ2xlJyk7XG5cdChbLi4ud2lnZ2xlRWxlbWVudHNdIGFzIEhUTUxFbGVtZW50W10pLmZvckVhY2gobWFrZVdpZ2dsZSk7XG59KTtcbiJdLCJuYW1lcyI6WyJjbGlja2VkUHJvamVjdCIsInByb2plY3RFbGVtZW50Iiwib3BlbiIsImdldEF0dHJpYnV0ZSIsIm1ha2VXaWdnbGUiLCJlbCIsImlubmVyIiwiaW5uZXJUZXh0IiwiY2hhcnMiLCJzcGxpdCIsIm1hcCIsImMiLCJpbm5lckhUTUwiLCJkZWxheSIsIk1hdGgiLCJyYW5kb20iLCJ0aW1lIiwiam9pbiIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJ3aWdnbGVFbGVtZW50cyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giXSwibWFwcGluZ3MiOiJBQUVBLFNBQVNBLGNBQWMsQ0FBQ0MsY0FBYyxFQUFFO0lBQ3ZDQyxJQUFJLENBQUNELGNBQWMsQ0FBQ0UsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDMUM7QUFHRCxTQUFTQyxVQUFVLENBQUNDLEVBQWUsRUFBRTtJQUNwQyxNQUFNQyxLQUFLLEdBQUdELEVBQUUsQ0FBQ0UsU0FBUyxBQUFDO0lBQzNCLE1BQU1DLEtBQUssR0FBR0YsS0FBSyxDQUFDRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUNDLEdBQUcsQ0FBQ0MsQ0FBQUEsQ0FBQyxHQUFJQSxDQUFDLElBQUksR0FBRyxHQUFHLFFBQVEsR0FBR0EsQ0FBQyxDQUFDLEFBQUM7SUFDaEVOLEVBQUUsQ0FBQ08sU0FBUyxHQUNYSixLQUFLLENBQUNFLEdBQUcsQ0FBQ0MsQ0FBQUEsQ0FBQyxHQUFJO1FBQ2QsTUFBTUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUNDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxBQUFDO1FBQ3RDLE1BQU1DLElBQUksR0FBR0YsSUFBSSxDQUFDQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxBQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxtREFBbUQsRUFBRUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFSCxLQUFLLENBQUMsSUFBSSxFQUFFRixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDNUcsQ0FBQyxDQUNETSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDWDtBQUVEQyxNQUFNLENBQUNDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFNO0lBQ3JDLE1BQU1DLGNBQWMsR0FBR0MsUUFBUSxDQUFDQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQUFBQztJQUMzRDtXQUFJRixjQUFjO0tBQUMsQ0FBbUJHLE9BQU8sQ0FBQ25CLFVBQVUsQ0FBQyxDQUFDO0NBQzNELENBQUMsQ0FBQyJ9